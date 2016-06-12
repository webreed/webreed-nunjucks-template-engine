// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.

"use strict";


const fs = require("fs");
const path = require("path");

const given = require("mocha-testdata");
const moment = require("moment");
const nunjucks = require("nunjucks");
const should = require("should");
const Observable = require("rxjs").Observable;

const Environment = require("webreed-core/lib/Environment").Environment;

const NunjucksTemplateEngine = require("../../lib/NunjucksTemplateEngine").NunjucksTemplateEngine;

const FakePaginationProvider = require("../fakes/FakePaginationProvider").FakePaginationProvider;


describe("NunjucksTemplateEngine", function () {

  beforeEach(function () {
    this.env = new Environment();
    this.env.baseUrl = "http://example.com";
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
      let context = { url: "http://example.com/simple.html" };

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
      let context = {
        url: "http://example.com/paginated.html",
        paginationProvider: new FakePaginationProvider()
      };

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
      let templateString = "{% set pagination = @.paginate(3, 5) %}<h1>Page {{ pagination.currentPageNumber }} of {{ pagination.pageCount }}</h1>";
      let templateParams = { _path: "about" };
      let context = {
        paginationProvider: new FakePaginationProvider()
      };

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

    it("exposes `@.time` to template", function () {
      let templateString = "Time Started: {{ @.time.format('YYYY-MM-DD') }}";
      let templateParams = { };
      let context = { };

      return this.nunjucksTemplateEngine.renderTemplateString(templateString, templateParams, context)
        .map(x => x.body)
        .toPromise()
        .should.eventually.be.eql(
          "Time Started: " + moment().format('YYYY-MM-DD')
        );
    });

    it("exposes `@.url` to template", function () {
      let templateString = "Url: {{ @.url }}";
      let templateParams = { };
      let context = { url: "http://example.com" };

      return this.nunjucksTemplateEngine.renderTemplateString(templateString, templateParams, context)
        .map(x => x.body)
        .toPromise()
        .should.eventually.be.eql(
          "Url: http://example.com"
        );
    });

    it("exposes `@.config` function to template", function () {
      let templateString = "Config Value: {{ @.config('life.meaning', 42) }}";
      let templateParams = { };
      let context = { };

      return this.nunjucksTemplateEngine.renderTemplateString(templateString, templateParams, context)
        .map(x => x.body)
        .toPromise()
        .should.eventually.be.eql(
          "Config Value: 42"
        );
    });

    it("exposes `date` filter to template", function () {
      let templateString = "Year: {{ '2016-06-06'|date('YYYY') }}";
      let templateParams = { };
      let context = { };

      return this.nunjucksTemplateEngine.renderTemplateString(templateString, templateParams, context)
        .map(x => x.body)
        .toPromise()
        .should.eventually.be.eql(
          "Year: 2016"
        );
    });

    given([
      [ "Url: {{ '/abc/def'|url }}", "Url: http://example.com/abc/def" ],
      [ "Url: {{ '/abc/def'|url('http://example.website/root/abc/def') }}", "Url: http://example.website/abc/def" ]
    ]).
    it("exposes `url` filter to template", function (templateString, expectedOutput) {
      let templateParams = { };
      let context = { };

      return this.nunjucksTemplateEngine.renderTemplateString(templateString, templateParams, context)
        .map(x => x.body)
        .toPromise()
        .should.eventually.be.eql(
          expectedOutput
        );
    });

  });

});
