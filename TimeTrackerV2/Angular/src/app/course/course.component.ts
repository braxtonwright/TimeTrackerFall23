import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})

export class CourseComponent implements OnInit {
  public course: any;
  public projects: any = [];
  public errMsg = '';

  private courseID: any;

  instructor: boolean = false;
  student: boolean = false;
  userID: string = '';

  public currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (!tempUser) {
      this.router.navigate(["/Login"]);
      return;
    }
    this.currentUser = JSON.parse(tempUser);
  }

  ngOnInit(): void {

    // get user type
    let currentUser = localStorage.getItem('currentUser');
    var userData = currentUser ? JSON.parse(currentUser) : null;
    var userType = userData.type;
    this.userID = userData.userID;
    if(userType === 'instructor'){
      this.instructor = true;
    }else if(userType === 'student'){
      this.student = true;
    }
    
    this.courseID = this.activatedRoute.snapshot.params['id']; // get course id from URL

    if(this.courseID) { // set course to course from local storage based on course ID
      let temp = localStorage.getItem('courses');

      if(temp){
        const courses = JSON.parse(temp);

        for(let course of courses){
          if(Number(course.courseID) === Number(this.courseID)){
            this.course = course;
          }
        }
      }
    }

    // get projects
    this.loadProjects();


  }

  loadProjects(): void {
    this.http.get("http://localhost:8080/api/Projects/" + this.courseID).subscribe((data: any) =>{ 
    this.projects = data;
    if(this.projects){
      localStorage.setItem("projects", JSON.stringify(this.projects));
    }
  });
  }

  join(ProjectID: any) {
    let req = {
      userID: this.currentUser.userID,
      projectID: ProjectID
    };

    this.http.post<any>('http://localhost:8080/api/joinGroup/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.loadProjects();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }


}
