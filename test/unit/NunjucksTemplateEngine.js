// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


import fs from "fs";
import path from "path";

import given from "mocha-testdata";
import moment from "moment";
import nunjucks from "nunjucks";
import should from "should";
import {Observable} from "rxjs";

import {Environment} from "webreed-core/lib/Environment";

import {NunjucksTemplateEngine} from "../../lib/NunjucksTemplateEngine";


describe("NunjucksTemplateEngine", function () {

  beforeEach(function () {
    this.env = new Environment();
    this.env.projectRootPath = path.resolve(__dirname, "../fixtures");

    this.fixture = (relativePath) => {
      return fs.readFileSync(path.join(this.env.projectRootPath, relativePath), "utf8");
    };

    this.nunjucksTemplateEngine = new NunjucksTemplateEngine(this.env, { });
  });


  it("is named 'NunjucksTemplateEngine'", function () {
    NunjucksTemplateEngine.name
      .should.be.eql("NunjucksTemplateEngine");
  });


  describe("#constructor(options)", function () {

    it("is a function", function () {
      NunjucksTemplateEngine.prototype.constructor
        .should.be.a.Function();
    });

  });


  describe("#nunjucksEnvironment", function () {

    it("is a nunjucks environment", function () {
      this.nunjucksTemplateEngine.nunjucksEnvironment
        .should.be.instanceOf(nunjucks.Environment);
    });

  });


  describe("#clearTemplateCache()", function () {

    it("is a function", function () {
      this.nunjucksTemplateEngine.clearTemplateCache
        .should.be.a.Function();
    });

    it("returns a promise", function () {
      this.nunjucksTemplateEngine.clearTemplateCache()
        .should.be.a.Promise();
    });

  });

  describe("#renderTemplate(template, templateParams, context)", function () {

    it("is a function", function () {
      this.nunjucksTemplateEngine.renderTemplate
        .should.be.a.Function();
    });

    it("throws error when the template does not exist", function () {
      let templateName = "does-not-exist.nunjucks";

      this.nunjucksTemplateEngine.renderTemplate(templateName)
        .forEach(() => {})
        .should.be.rejected();
    });

    it("yields single rendered output when source template is not paginated", function () {
      let templateName = "simple.nunjucks";
      let templateParams = { title: "My Page!" };
      let context = { };

      return this.nunjucksTemplateEngine.renderTemplate(templateName, templateParams, context)
        .map(x => x.body)
        .toPromise()
        .should.eventually.be.eql(
          this.fixture("outputs/simple.html")
        );
    });

    it("yields multiple rendered outputs when source template is paginated", function () {
      let templateName = "paginated.nunjucks";
      let templateParams = { _path: "about" };
      let context = { };

      return this.nunjucksTemplateEngine.renderTemplate(templateName, templateParams, context)
        .toArray().toPromise()
        .should.eventually.be.eql([
          {
            page: "index",
            body: this.fixture("outputs/paginated.1.html")
          },
          {
            page: "2",
            body: this.fixture("outputs/paginated.2.html")
          }
        ]);
    });

  });

  describe("#renderTemplateString(templateName, templateParams, context)", function () {

    it("is a function", function () {
      this.nunjucksTemplateEngine.renderTemplateString
        .should.be.a.Function();
    });

    it("yields single rendered output when source template is not paginated", function () {
      let templateString = "<h1>{{ title }}</h1>";
      let templateParams = { title: "My Page!" };
      let context = { };

      return this.nunjucksTemplateEngine.renderTemplateString(templateString, templateParams, context)
        .map(x => x.body)
        .toPromise()
        .should.eventually.be.eql(
          "<h1>My Page!</h1>"
        );
    });

    it("yields multiple rendered outputs when source template is paginated", function () {
      let templateString = "{% set pagination = paginate(5, 3) %}<h1>Page {{ pagination.currentPageNumber }} of {{ pagination.pageCount }}</h1>";
      let templateParams = { _path: "about" };
      let context = { };

      return this.nunjucksTemplateEngine.renderTemplateString(templateString, templateParams, context)
        .toArray().toPromise()
        .should.eventually.be.eql([
          {
            page: "index",
            body: "<h1>Page 1 of 2</h1>"
          },
          {
            page: "2",
            body: "<h1>Page 2 of 2</h1>"
          }
        ]);
    });

    it("exposes `@time` to template", function () {
      let templateString = "Time Started: {{ @time.format('YYYY-MM-DD') }}";
      let templateParams = { };
      let context = { };

      return this.nunjucksTemplateEngine.renderTemplateString(templateString, templateParams, context)
        .map(x => x.body)
        .toPromise()
        .should.eventually.be.eql(
          "Time Started: " + moment().format('YYYY-MM-DD')
        );
    });

    it("exposes `config` function to template", function () {
      let templateString = "Config Value: {{ config('life.meaning', 42) }}";
      let templateParams = { };
      let context = { };

      return this.nunjucksTemplateEngine.renderTemplateString(templateString, templateParams, context)
        .map(x => x.body)
        .toPromise()
        .should.eventually.be.eql(
          "Config Value: 42"
        );
    });

  });

});
