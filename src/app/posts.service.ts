import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';

import { Post } from './post.model';
import { Subject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  error = new Subject<string>();

  constructor(private http: HttpClient) { }

  onCreateAndStorePosts(title: string, content: string) {
    const postData: Post = {title, content};
    this.http
    .post<{name: string}>(
      'https://angular-maxi-http.firebaseio.com/posts.json',
      postData,
      // tslint:disable-next-line:max-line-length
      // sometimes you need access to the entire response object and not just to the extracted body data, sometimes you need to find out which status code was attached or you need some response headers and in such cases, you can change the way the Angular HttpClient parses that response and you can basically tell Angular, "hey, please don't give me the unpacked, the extracted response data you found in the body, give me the full response instead" and let's do that for sending a POST request for example.
      {
        observe: 'response'
      }
    )
    .subscribe(
      responseData => {
        console.log(responseData);
      },
      error => {
        this.error.next(error.message);
      });
  }

  onFetchPosts() {
    // tslint:disable-next-line:max-line-length
    // you could have done that directly in the URL but by using the HttpParams object and the configuration object, it's a bit more convenient. Now by the way, in case you're wondering what these parameters do, custom key does nothing, that's just something I came up with, it's not supported by Firebase but as I mentioned, it's also no problem if we add this. Print pretty does something in the response, it prints this in a more pretty way, it adds some extra whitespace and line breaks so that this is a more human readable.
    let searchParams = new HttpParams();
    searchParams = searchParams.append('print', 'pretty');
    searchParams = searchParams.append('custom', 'key');
    // tslint:disable-next-line:max-line-length
    // pipe as you learned is a method that allows you to funnel your observable data through multiple operators before they reach the subscribe method. The map operator allows us to get some data and return new data which is then automatically re-wrapped into an observable so that we can still subscribe to it, if it would not be wrapped into an observable again, we could not subscribe.
    return this.http
      // tslint:disable-next-line:max-line-length
      // between the angled brackets, you store the type which this response will actually return as a body once it's done. So it's the response body type which is stored here and that will then automatically be handled by the Angular HttpClient and TypeScript understands this and now knows that the response data will have this type format as you can tell and this is also available on post requests, it's available on all requests, you can use these angled brackets to add this extra piece of information which is totally optional but recommended and helpful about the data you're getting back. yukarida post request te yaptik. name dememizin sebebi tekrar request yaptigimizda console da gorduk 'name' property
      .get<{[key: string]: Post}>('https://angular-maxi-http.firebaseio.com/posts.json',
        {
          headers: new HttpHeaders({'Custom-Header': 'Hello'}),
          params: searchParams,
          responseType: 'json'
        }
      )
      // tslint:disable-next-line:max-line-length
      .pipe(
        // tslint:disable-next-line:max-line-length
        map(responseData => {// that should now return the converted response data and here the idea is that we return an array of posts instead of an object with that cryptic key which then holds our actual post. Now to convert a Javascript object which we have here to an array, we have to manually loop through all the keys and create a new array.
        const postsArray: Post[] = [];
        for (const key in responseData) {
          // tslint:disable-next-line:max-line-length
          // if you're using a for/in loop where you check if response data has key as its own property so that you're not trying to access the property of some prototype
          if (responseData.hasOwnProperty(key)) {
            // tslint:disable-next-line:max-line-length
            // This will pull out all the key-value pairs of that nested object we're accessing here and let's close this with curly braces too because this now allows me to also add one new key-value pair to that object we're adding to posts array and that should be an ID field which actually stores the key because that key here, that cryptic string is a perfect ID and it is a unique ID generated by Firebase.
            postsArray.push({...responseData[key], id: key});
          }
        }
        return postsArray;
      }),
      catchError(errorRes => {
        // send to analytics server
        // tslint:disable-next-line:max-line-length
        // this of course doesn't do anything useful here but it's just an idea that you could consider using catch error if you have some generic error handling task you also want to execute.
        return throwError(errorRes);
      })
    );
  }

  onDeletePosts() {
    // tslint:disable-next-line:max-line-length
    // if I want to be informed about that deletion process in the component, I will return my observable here and I will not subscribe here in the service but instead now in the app component, in onClearPosts, I can reach out to the post service and call delete posts and since this returns an observable, we now have to subscribe here.
    return this.http
      .delete(
        'https://angular-maxi-http.firebaseio.com/posts.json',
        {
          observe: 'events',
          // tslint:disable-next-line:max-line-length
          // The default here is JSON, which means the response data, so the data in the body of your response is JSON and that tells Angular that it should automatically parse it and convert it to a Javascript object. You could however also tell Angular the response side will be text and please keep it as text, don't try to convert it to a Javascript object.It could also be a blob if it is a file for example,the official docs of course are the place where you can learn all about all available response types.
          responseType: 'text'
        }
      )
      // tslint:disable-next-line:max-line-length
      // tab operator and that simply allows us to execute some code without altering the response, so that we basically just can do something with the response but not disturb our subscribe function and the functions we passed as arguments to subscribe.
      .pipe(
        tap(event => {
          console.log(event);
          if (event.type === HttpEventType.Sent) {
            // ...
          }
          if (event.type === HttpEventType.Response) {
            console.log(event.body);
          }
        })
      );
  }
}
