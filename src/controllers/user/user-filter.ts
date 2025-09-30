import { Router } from "express";
import { celebrate, Joi } from "celebrate";
import bodyParser from "body-parser";
import { UserFilterService } from "../../services/user/user-filter";
import { OPERATORS } from "../../lib/filter/types";

const router = Router();
const userFilterService = new UserFilterService();
router.use(bodyParser.urlencoded({ extended: true }));

const conditionSchema = Joi.object({
  field: Joi.string().required(),
  operator: Joi.string()
    .valid(...OPERATORS)
    .required(),
  value: Joi.any(),
});

const filterValidationSchema = Joi.object({
  and: Joi.array().items(
    Joi.alternatives().try(
      conditionSchema,
      Joi.object({
        or: Joi.array().items(conditionSchema),
      })
    )
  ),
  config: Joi.string().valid("prisma", "sql").optional(),
});

router.post(
  "/filter",
  celebrate({
    body: filterValidationSchema,
  }),
  async (req, res) => {
    try {
      const filterQueries = req.body;
      const config = req.body.config;
      const data = await userFilterService.filterUsers(filterQueries, config);
      res.status(200).json({
        isError: false,
        body: {
          message: "Users filtered successfully",
          data,
        },
      });
    } catch (err) {
      const error = err as Error & { status?: number };
      res.status(error.status || 500).json({
        isError: true,
        body: {
          message: JSON.stringify(error.message),
        },
      });
    }
  }
);

router.get(
  "/filter",
  celebrate({
    query: {
      filter: Joi.string().required(),
    },
  }),
  async (req, res) => {
    try {
      const encodedFilter = req.query.filter as string;

      let filterQueries;
      let config;
      try {
        const decodedFilter = decodeURIComponent(encodedFilter as string);
        filterQueries = JSON.parse(decodedFilter);
        config = filterQueries.config;
      } catch (decodeError) {
        return res.status(400).json({
          isError: true,
          body: {
            message:
              "Invalid encoded filter format. Expected URI encoded JSON.",
          },
        });
      }

      const { error: validationError } =
        filterValidationSchema.validate(filterQueries);

      if (validationError) {
        return res.status(400).json({
          isError: true,
          body: {
            message: `Invalid filter structure: ${validationError.message}`,
          },
        });
      }

      const data = await userFilterService.filterUsers(filterQueries, config);
      res.status(200).json({
        isError: false,
        body: {
          message: "Users filtered successfully",
          data,
        },
      });
    } catch (err) {
      const error = err as Error & { status?: number };
      res.status(error.status || 500).json({
        isError: true,
        body: {
          message: JSON.stringify(error.message),
        },
      });
    }
  }
);

export default router;
