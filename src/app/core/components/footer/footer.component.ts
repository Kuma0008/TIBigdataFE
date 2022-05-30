import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.less']
})
export class FooterComponent implements OnInit {

  constructor(
    public router: Router
  ) { }

  ngOnInit() {
  }

  toCollectedInfo(): void {
    this.router.navigateByUrl("/about/collected-info");
  }

  toMemberPolicy(): void {
    this.router.navigateByUrl("/about/member-policy");
  }

  toServiceGuide(): void {
    this.router.navigateByUrl("/about/service-guide");
  }
}
