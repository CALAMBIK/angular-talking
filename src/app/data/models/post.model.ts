import { Profile } from './profile.model';

export type PostCreateDto = {
  title: string;
  content: string;
  authorId: number;
};

export type Post = {
  id: number;
  title: string;
  communityId: number;
  content: string;
  author: Profile;
  images: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  likesUsers: string[];
  comments: PostComment[];
};

export type PostComment = {
  id: number;
  text: string;
  author: Profile;
  postId: number;
  commentId: number;
  createdAt: string;
  updatedAt: string;
};

export type CommentCreateDto = {
  text: string;
  authorId: number;
  postId: number;
};
