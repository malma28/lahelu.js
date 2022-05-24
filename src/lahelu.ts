import { PostApi } from "./post";
import { User, UserApi } from "./user";

export class Lahelu {
    public user: UserApi;
    public post: PostApi;

    constructor() {
        this.user = UserApi.get();
        this.post = PostApi.get(this.user);
    }
}