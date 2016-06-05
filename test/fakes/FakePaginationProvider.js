// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.

"use strict";


const paginate = require("webreed-core/lib/pagination").paginate;


class FakePaginationProvider {

  paginate(entriesPerPage, entryCount) {
    return paginate(entriesPerPage, entryCount, pageNumber => {
      let pageKey = pageNumber == 1 ? "index" : pageNumber.toString();
      let pageUrl = "http://example.com/topic/" + pageNumber;
      return [ pageKey, pageUrl ];
    });
  }

}


exports.FakePaginationProvider = FakePaginationProvider;
