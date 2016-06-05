// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.

"use strict";


const given = require("mocha-testdata");
const should = require("should");

const paginate = require("../../../lib/pagination/paginate").paginate;


describe("pagination/paginate", function () {

  it("is a function", function () {
    paginate.should.be.a.Function();
  });


  given([
    [ 10, 100, {
      pageCount: 10,
      numbers: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
      keys: [ "index", "2", "3", "4", "5", "6", "7", "8", "9", "10" ],
      endEntryIndex: 10,
      lastEntryIndex: 9,
    } ],

    [ 50, 100, {
      pageCount: 2,
      numbers: [ 1, 2 ],
      keys: [ "index", "2" ],
      endEntryIndex: 50,
      lastEntryIndex: 49,
    } ],

    [ 40, 100, {
      pageCount: 3,
      numbers: [ 1, 2, 3 ],
      keys: [ "index", "2", "3" ],
      endEntryIndex: 40,
      lastEntryIndex: 39,
    } ],
  ]).
  it("returns an iterator representing the first page of the paginated sequence", function (entriesPerPage, entryCount, expectedValues) {
    let iterator = paginate(entriesPerPage, entryCount, pageNumber => {
      let pageKey = pageNumber == 1 ? "index" : pageNumber.toString();
      let pageUrl = "http://example.com/topic/" + pageKey;
      return [ pageKey, pageUrl ];
    });

    iterator.entryCount
      .should.be.eql(entryCount);
    iterator.entriesPerPage
      .should.be.eql(entriesPerPage);
    iterator.pageCount
      .should.be.eql(expectedValues.pageCount);

    iterator.numbers
      .should.be.eql(expectedValues.numbers);
    iterator.keys
      .should.be.eql(expectedValues.keys);

    iterator.currentPageNumber
      .should.be.eql(1);
    iterator.hasPrevPage
      .should.be.false();
    iterator.hasNextPage
      .should.be.true();

    iterator.firstEntryIndex
      .should.be.eql(0);
    iterator.endEntryIndex
      .should.be.eql(expectedValues.endEntryIndex);
    iterator.lastEntryIndex
      .should.be.eql(expectedValues.lastEntryIndex);

    iterator.currentPageKey
      .should.be.eql("index");
    iterator.currentPageUrl
      .should.be.eql("http://example.com/topic/index");
  });


  describe("result", function () {

    beforeEach(function () {
      this.iterator = paginate(10, 100, pageNumber => {
        let pageKey = pageNumber == 1 ? "index" : pageNumber.toString();
        let pageUrl = "http://example.com/topic/" + pageKey;
        return [ pageKey, pageUrl ];
      });
    });

    describe("#getPageKey", function () {

      it("is a function", function () {
        this.iterator.getPageKey
          .should.be.a.Function();
      });

      given(-1, 0, 11).
      it("throws error when `pageNumber` argument is out of range", function (pageNumber) {
        (() => this.iterator.getPageKey(pageNumber))
          .should.throw(`page number '${pageNumber}' out of range`);
      });

      given([
        [ 1, "index" ],
        [ "2", "2" ]
      ]).
      it("returns the expected result", function (pageNumber, expectedResult) {
        this.iterator.getPageKey(pageNumber)
          .should.be.eql(expectedResult);
      });

    });

    describe("#getPageNumber", function () {

      it("is a function", function () {
        this.iterator.getPageNumber
          .should.be.a.Function();
      });

      it("throws error when `pageKey` argument is not found", function () {
        (() => this.iterator.getPageNumber("does-not-exist"))
          .should.throw(`page key 'does-not-exist' was not found`);
      });

      given([
        [ "index", 1 ],
        [ "2", 2 ]
      ]).
      it("returns the expected result", function (pageNumber, expectedResult) {
        this.iterator.getPageNumber(pageNumber)
          .should.be.eql(expectedResult);
      });

    });

    describe("#getUrlForPageKey", function () {

      it("is a function", function () {
        this.iterator.getUrlForPageKey
          .should.be.a.Function();
      });

      it("throws error when `pageKey` argument is not found", function () {
        (() => this.iterator.getUrlForPageKey("does-not-exist"))
          .should.throw(`page key 'does-not-exist' was not found`);
      });

      given([
        [ "index", "http://example.com/topic/index" ],
        [ "2", "http://example.com/topic/2" ]
      ]).
      it("returns the expected result", function (pageKey, expectedResult) {
        this.iterator.getUrlForPageKey(pageKey)
          .should.be.eql(expectedResult);
      });

    });

    describe("#getUrlForPageNumber", function () {

      it("is a function", function () {
        this.iterator.getUrlForPageNumber
          .should.be.a.Function();
      });

      given(-1, 0, 11).
      it("throws error when `pageNumber` argument is out of range", function (pageNumber) {
        (() => this.iterator.getUrlForPageNumber(pageNumber))
          .should.throw(`page number '${pageNumber}' out of range`);
      });

      given([
        [ 1, "http://example.com/topic/index" ],
        [ "2", "http://example.com/topic/2" ]
      ]).
      it("returns the expected result", function (pageNumber, expectedResult) {
        this.iterator.getUrlForPageNumber(pageNumber)
          .should.be.eql(expectedResult);
      });

    });

    describe("#first", function () {

      it("is a function", function () {
        this.iterator.first
          .should.be.a.Function();
      });

      it("returns an iterator representing the first page in sequence", function () {
        this.iterator.first()
          .should.be.exactly(this.iterator);
      });

    });

    describe("#next", function () {

      it("is a function", function () {
        this.iterator.next
          .should.be.a.Function();
      });

      it("returns the next iterator in sequence (1)", function () {
        this.iterator.next()
          .should.have.properties({
            currentPageNumber: 2,
            hasPrevPage: true,
            hasNextPage: true,
            firstEntryIndex: 10,
            endEntryIndex: 20,
            lastEntryIndex: 19,
            currentPageKey: "2",
            currentPageUrl: "http://example.com/topic/2"
          });
      });

      it("returns the next iterator in sequence (2)", function () {
        this.iterator.next().next()
          .should.have.properties({
            currentPageNumber: 3,
            hasPrevPage: true,
            hasNextPage: true,
            firstEntryIndex: 20,
            endEntryIndex: 30,
            lastEntryIndex: 29,
            currentPageKey: "3",
            currentPageUrl: "http://example.com/topic/3"
          });
      });

      it("returns `null` at the end of the sequence", function () {
        let endOfSequence = this.iterator;
        for (let i = 0; i < 10; ++i) {
          endOfSequence = endOfSequence.next();
        }

        should(endOfSequence).be.null();
      });

    });

  });

});
