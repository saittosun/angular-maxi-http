import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Post } from './post.model';
import { PostsService } from './posts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loadedPosts: Post[] = [];
  isFetching = false;

  constructor(private http: HttpClient,
              private postsService: PostsService) {}

  ngOnInit() {
    this.isFetching = true;
    this.postsService.onFetchPosts().subscribe(posts => {
      this.isFetching = false;
      this.loadedPosts = posts;
    });
  }

  onCreatePost(postData: Post) {
    this.postsService.onCreateAndStorePosts(postData.title, postData.content);
  }

  onFetchPosts() {
    this.isFetching = true;
    this.postsService.onFetchPosts().subscribe(posts => {
      this.isFetching = false;
      this.loadedPosts = posts;
    });
  }

  onClearPosts() {
    // tslint:disable-next-line:max-line-length
    // why do I want to subscribe here? Well if I deleted all posts, I also want to clear my loaded posts array here in the component. So I will add a method here where I don't really care about the result of our request or of the response but I know that this function here will only run if it succeeded and therefore here, I will then simply just set this loaded post equal to an empty array again to reset it and with these changes to the service and to the component,
    this.postsService.onDeletePosts().subscribe(() => {
      this.loadedPosts = [];
    })
  }



}
