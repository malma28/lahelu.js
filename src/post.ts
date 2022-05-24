import { request } from "undici";
import { GetError } from "./errors";
import { User, UserApi } from "./user";

export interface Post {
    id: string;
    key: string;
    file: string;
    url: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    user: User;
    upvotes: number;
    downvotes: number;
    popularity: number;
    createdAt: number;
    createdAtDate: Date;
    archived: boolean;
}

export class PostApi {
    private static instance: PostApi = undefined;
    private userApi: UserApi;

    private constructor(userApi: UserApi) {
        this.userApi = userApi;
    }

    private async parsePost(postInfo: any): Promise<Post> {
        const post: Post = {
            id: postInfo['postID'],
            key: postInfo['postKey'],
            file: postInfo['file'],
            url: postInfo['url'],
            title: postInfo['title'],
            description: postInfo['description'],
            category: postInfo['category'],
            tags: postInfo['tags'],
            user: await this.userApi.getByName(postInfo['username']),
            upvotes: postInfo['totalUpvotes'],
            downvotes: postInfo['totalDownvotes'],
            popularity: postInfo['popularity'],
            createdAt: postInfo['createTime'],
            createdAtDate: undefined,
            archived: postInfo['archived'],
        };
        post.createdAtDate = post.createdAt !== 0 ? new Date(post.createdAt) : post.createdAtDate;
        return post;
    }

    public async getById(id: string): Promise<Post> {
        const response = await request(`https://lahelu.com/api/post/get/${id}`);
        if(response.statusCode !== 200 && response.statusCode !== 304) throw new GetError("post by id");
        const responseBody = await response.body.json();
        return this.parsePost(responseBody['postInfo']);
    }

    public async getFeed(popularity: number): Promise<Post[]> {
        const response = await request(`https://lahelu.com/api/post/get_feed?popularity=${popularity}`)
        if(response.statusCode !== 200 && response.statusCode !== 304) throw new GetError("post feed");
        const responseBody = await response.body.json();
        const postInfos = responseBody['postInfos'];
        let posts: Post[] = [];
        for(let index = 0; index < postInfos.length; index++) {
            posts.push(await this.parsePost(postInfos[index]));
        }
        return posts;
    }

    public async getByCategory(category: string) {
        const response = await request(`https://lahelu.com/api/post/get_category_posts?category=${category}`);
        if(response.statusCode !== 200 && response.statusCode !== 304) throw new GetError("post by category");
        const responseBody = await response.body.json();
        const postInfos = responseBody['postInfos'];
        let posts: Post[] = [];
        for(let index = 0; index < postInfos.length; index++) {
            posts.push(await this.parsePost(postInfos[index]));
        }
        return posts;
    }

    public async getFromUser(userId: string) {
        const response = await request(`https://lahelu.com/api/post/get_user_posts?userID=${userId}`);
        if(response.statusCode !== 200 && response.statusCode !== 304) throw new GetError("post from user");
        const responseBody = await response.body.json();
        const postInfos = responseBody['postInfos'];
        let posts: Post[] = [];
        for(let index = 0; index < postInfos.length; index++) {
            posts.push(await this.parsePost(postInfos[index]));
        }
        return posts;
    }

    public static get(userApi: UserApi): PostApi {
        if(PostApi.instance === undefined) {
            PostApi.instance = new PostApi(userApi);
        }
        return PostApi.instance;
    }
}