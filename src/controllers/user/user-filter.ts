import { Router } from "express";
import { celebrate, Joi } from "celebrate";
import bodyParser from "body-parser";
import { UserFilterService } from "../../services/user/user-filter";
import { filterValidationSchema } from "../../lib/filter/types";

const router = Router();
const userFilterService = new UserFilterService();
router.use(bodyParser.urlencoded({ extended: true }));

router.post(
  "/filter",
  celebrate({
    body: filterValidationSchema,
  }),
  async (req, res) => {
    try {
      const filterQueries = req.body;
      const config = req.body?.config;
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
      const data = await userFilterService.encodeUrlEncodedQuery(encodedFilter);
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
