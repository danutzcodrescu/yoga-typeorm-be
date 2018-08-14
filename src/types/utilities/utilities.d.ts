import { User } from "entity/User";
import { Response } from "express";
import { userLoader } from "../../loaders/user.loaders";

interface AppContext {
    token: string;
    response: Response,
    user: User,
    userLoader: ReturnType<typeof userLoader>
}
