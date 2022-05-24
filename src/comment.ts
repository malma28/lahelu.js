import { request } from "undici";
import { GetError } from "./errors";
import { Post } from "./post";
import { User, UserApi } from "./user";

export interface PostComment {
    key: string;
    uict: string;
    content: string;
    upvotes: number;
    createdAt: number;
    createdAtDate: Date;
    user: User;
}

export class CommentApi {
    private static instance: CommentApi = undefined;

    private userApi: UserApi;

    private constructor(userApi: UserApi) {
        this.userApi = userApi;
    }

    public async getFromPost(postKey: string): Promise<PostComment[]> {
        const response = await request(`https://lahelu.com/api/comment/get_batch?postKey=${postKey}`);
        if(response.statusCode !== 200 && response.statusCode !== 304) throw new GetError("comment from post");
        const responseBody = await response.body.json();
        const commentInfos = responseBody['commentInfos'];
        let comments: PostComment[] = [];
        for(let index = 0; index < commentInfos.length; index++) {
            const commentInfo = commentInfos[index];
            const comment: PostComment = {
                key: commentInfo['commentKey'],
                uict: commentInfo['uict'],
                content: commentInfo['content'],
                upvotes: commentInfo['totalUpvotes'],
                createdAt: commentInfo['createTime'],
                createdAtDate: undefined,
                user: await this.userApi.getByName(commentInfo['username']),
            };
            comment.createdAtDate = comment.createdAt !== 0 ? new Date(comment.createdAt) : undefined;
            comments.push(comment);
        }
        return comments;
    }

    public static get(userApi: UserApi): CommentApi {
        if(CommentApi.instance === undefined) {
            CommentApi.instance = new CommentApi(userApi);
        }
        return CommentApi.instance;
    }
}