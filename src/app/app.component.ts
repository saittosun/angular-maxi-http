import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from './post.model';
import { PostsService } from './posts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  loadedPosts: Post[] = [];
  isFetching = false;
  error = null;
  private errorSub: Subscription;

  constructor(private postsService: PostsService) {}

  ngOnInit() {
    this.errorSub = this.postsService.error.subscribe(errorMessage => {
      this.error = errorMessage;
    });
    this.isFetching = true;
    this.postsService.onFetchPosts().subscribe(
      posts => {
      this.isFetching = false;
      this.loadedPosts = posts;
    },
      error => {
      this.error = error.error.error;
    });
  }

  ngOnDestroy() {
    this.errorSub.unsubscribe();
  }

  onCreatePost(postData: Post) {
    this.postsService.onCreateAndStorePosts(postData.title, postData.content);
  }

  onFetchPosts() {
    this.isFetching = true;
    this.postsService.onFetchPosts().subscribe(
      posts => {
      this.isFetching = false;
      this.loadedPosts = posts;
    });
  }

  onClearPosts() {
    // tslint:disable-next-line:max-line-length
    // why do I want to subscribe here? Well if I deleted all posts, I also want to clear my loaded posts array here in the component. So I will add a method here where I don't really care about the result of our request or of the response but I know that this function here will only run if it succeeded and therefore here, I will then simply just set this loaded post equal to an empty array again to reset it and with these changes to the service and to the component,
    this.postsService.onDeletePosts().subscribe(() => {
      this.loadedPosts = [];
    });
  }



}
