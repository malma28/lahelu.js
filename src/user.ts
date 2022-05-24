import { BodyMixin, request } from "undici";
import { GetError } from "./errors";

export interface User {
    id: string;
    name: string;
    description: string;
    email: string;
    file: string;
    upvotes: number;
    downvotes: number;
    posts: number;
    createdAt: number;
    createdAtDate: Date;
    updatedAt: number;
    updatedAtDate: Date;
    uploadAt: number;
    uploadAtDate: Date;
    commentAt: number;
    commentAtDate: Date;
}

export class UserApi {
    private static instance: UserApi = undefined;

    private constructor() {
        
    }

    public async getByName(username: string): Promise<User> {
        const response = await request(`https://lahelu.com/api/user/get/${username}`);
        if(response.statusCode !== 200) throw new GetError("user by name");
        const responseBody = await response.body.json();
        const userInfo = responseBody['userInfo'];
        const user: User = {
            id: userInfo['userID'],
            name: userInfo['username'],
            description: userInfo['description'],
            email: userInfo['email'],
            file: userInfo['file'],
            upvotes: userInfo['totalUpvotes'],
            downvotes: userInfo['totalDownvotes'],
            posts: userInfo['totalPosts'],
            createdAt: userInfo['createTime'],
            createdAtDate: undefined,
            updatedAt: userInfo['updateTime'],
            updatedAtDate: undefined,
            uploadAt: userInfo['uploadTime'],
            uploadAtDate: undefined,
            commentAt: userInfo['commentTime'],
            commentAtDate: undefined
        };
        user.createdAtDate = user.createdAt !== 0 ? new Date(user.createdAt) : undefined;
        user.updatedAtDate = user.updatedAt !== 0 ? new Date(user.updatedAt) : undefined;
        user.uploadAtDate = user.uploadAt !== 0 ? new Date(user.updatedAt) : undefined;
        user.commentAtDate = user.commentAt !== 0 ? new Date(user.commentAt) : undefined;
        return user;
    }

    static get(): UserApi {
        if(UserApi.instance === undefined) {
            UserApi.instance = new UserApi();
        }
        return UserApi.instance;
    }
}