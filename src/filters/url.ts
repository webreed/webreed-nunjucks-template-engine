// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


import * as url from "url";

import nunjucks = require("nunjucks");

import {Environment} from "webreed-core/lib/Environment";


export function install(env: Environment, nunjucksEnvironment: nunjucks.Environment) {
  nunjucksEnvironment.addFilter("url", (value, baseUrl) => {
    return url.resolve(baseUrl || env.baseUrl, value);
  });
}
