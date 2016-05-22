// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


import _ = require("lodash");
import moment = require("moment");
import nunjucks = require("nunjucks");
import {Observable, Subscriber} from "rxjs";

import {Environment} from "webreed-core/lib/Environment";
import {TemplateEngine, TemplateOutput} from "webreed-core/lib/plugin/TemplateEngine";

import {Pagination} from "./Pagination";


interface RenderTemplateFunction {
  (templateContext: Object): Promise<string>;
}


/**
 * Nunjucks template engine.
 */
export class NunjucksTemplateEngine implements TemplateEngine {

  private _env: Environment;
  private _nunjucksOptions: Object;
  private _nunjucksEnvironment: nunjucks.Environment;


  /**
   * @param env
   *   An environment that represents a webreed project.
   * @param nunjucksOptions
   *   Options that are provided to nunjucks environment.
   */
  constructor(env: Environment, nunjucksOptions: Object) {
    this._env = env;
    this._nunjucksOptions = nunjucksOptions;

    this._initNunjucksEnvironment();
  }


  /**
   * The Nunjucks environment instance for the Nunjucks template engine which can be
   * extended with custom filters and globals.
   *
   * This property can be used by the application that is hosting the webreed instance or
   * by webreed extension plugins.
   *
   * Refer to the Nunjucks API documentation for further information:
   * https://mozilla.github.io/nunjucks/api.html
   */
  get nunjucksEnvironment(): nunjucks.Environment {
    return this._nunjucksEnvironment;
  }


  public clearTemplateCache(): Promise<void> {
    this._initNunjucksEnvironment();
    return Promise.resolve();
  }

  public renderTemplate(templateName: string, templateProperties: any, context: any): Observable<TemplateOutput> {
    return this._executeRender(templateProperties, templateContext => {
      return new Promise<string>((resolve, reject) => {
        this._nunjucksEnvironment.render(templateName, templateContext,
            (err, result) => err ? reject(err) : resolve(result)
          );
      });
    });
  }

  public renderTemplateString(template: string, templateProperties: any, context: any): Observable<TemplateOutput> {
    let compiledTemplate = nunjucks.compile(template, this._nunjucksEnvironment, templateProperties["__sourceFilePath"]);

    return this._executeRender(templateProperties, templateContext => {
      return new Promise<string>((resolve, reject) => {
        compiledTemplate.render(templateContext,
            (err, result) => err ? reject(err) : resolve(result)
          );
      });
    });
  }


  private _initNunjucksEnvironment(): void {
    let templateLoader = new nunjucks.FileSystemLoader();
    templateLoader.init([ this._env.resolvePath("templates") ], null);

    this._nunjucksEnvironment = new nunjucks.Environment(templateLoader, this._nunjucksOptions);
  }

  private _executeRender(templateProperties: any, renderTemplateFn: RenderTemplateFunction): Observable<TemplateOutput> {
    let templateContext = this._prepareTemplateContext(templateProperties);

    return new Observable<TemplateOutput>((observer: Subscriber<TemplateOutput>) => {
      let pagination: Pagination = null;
      let currentPageIterator = { number: 1 };

      if (this._hasRequirementsForPagination(templateContext)) {
        templateContext["paginate"] = (entryCount: any, entriesPerPage: any) => {
          if (pagination === null) {
            entryCount = parseInt(entryCount);
            entriesPerPage = parseInt(entriesPerPage);

            let pageCount = Pagination.calculatePageCount(entryCount, entriesPerPage);
            let pages = this._paginate(pageCount, templateContext);
            pagination = new Pagination(entryCount, entriesPerPage, pages, currentPageIterator);
          }
          return pagination;
        };
      }

      function renderPage() {
        renderTemplateFn(templateContext)
          .then(renderedOutputString => {
            let templateOutput = new TemplateOutput();
            templateOutput.page = !!pagination ? pagination.currentPageKey : undefined;
            templateOutput.body = renderedOutputString;

            observer.next(templateOutput);

            if (!pagination || currentPageIterator.number >= pagination.pageCount) {
              observer.complete();
            }
            else {
              ++currentPageIterator.number;
              renderPage();
            }
          })
          .catch(err => observer.error(err));
      }

      renderPage();
    });
  }

  private _prepareTemplateContext(templateProperties: any): any {
    let templateContext = _.cloneDeep(templateProperties || {});

    templateContext["@time"] = moment();
    templateContext["config"] = this._env.config.get.bind(this._env.config);

    return templateContext;
  }

  private _hasRequirementsForPagination(templateProperties: any): boolean {
    return typeof templateProperties["_path"] === "string";
  }

  private _paginate(pageCount: number, templateContext: any): Array<[string, string]> {
    let pages = new Array<[string, string]>();
    for (let n = 1; n <= pageCount; ++n) {
      let pageKey = ( n === 1 ? "index" : n.toString() );
      let contentRelativePath = this._env.getOutputRelativePathForResource(templateContext["_path"], templateContext["_extension"], pageKey);
      let pageUrl = this._env.getUrlForResource(contentRelativePath, templateContext["_baseUrl"]);
      pages.push([ pageKey, pageUrl ]);
    }
    return pages;
  }

}
