// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


import {PaginationIterator} from "./PaginationIterator";


/**
 * Creates an iterator for a paginated sequence of entries.
 *
 * @param entriesPerPage
 *   Maximum number of entries to show on any single page.
 * @param entryCount
 *   Total number of entries in the sequence.
 * @param getPageInfo
 *   A function that returns the key and url of a given page number.
 *
 * @returns
 *   An immutable iterator representing the first page of the paginated sequence.
 */
export function paginate(entriesPerPage: number, entryCount: number, getPageInfo: GetPageInfoFunction): PaginationIterator {
  let pages = new Array( calculatePageCount(entriesPerPage, entryCount) )
    .fill(0)
    .map((_, i) => getPageInfo(i + 1));

  let byIndex = Array.from(pages, x => x[1]);
  let byKey = new Map(pages);

  let pageNumbers = Object.freeze(Array.from(pages, (x, i) => i + 1));
  let pageKeys = Object.freeze(Array.from(pages, x => x[0]));


  function getPageKey(pageNumber: any): string {
    let n = parseInt(pageNumber);

    console.assert(n > 0 && n <= pages.length,
        `page number '${n}' out of range`);

    return pageKeys[n - 1];
  }

  function getPageNumber(pageKey: any): number {
    pageKey = pageKey.toString();

    let keyIndex = pageKeys.indexOf(pageKey);
    console.assert(keyIndex !== -1,
        `page key '${pageKey}' was not found`);

    return keyIndex + 1;
  }

  function getUrlForPageKey(pageKey: any): string {
    let k = pageKey.toString();

    let url = byKey.get(k);

    console.assert(url !== undefined,
        `page key '${k}' was not found`);

    return url;
  }

  function getUrlForPageNumber(pageNumber: any): string {
    let pageIndex = parseInt(pageNumber) - 1;

    console.assert(pageIndex >= 0 && pageIndex < pages.length,
        `page number '${pageNumber}' out of range`);

    return byIndex[pageIndex];
  }


  let first = createIterator(1);


  function createIterator(currentPageNumber: number): PaginationIterator {
    let firstEntryIndex = (currentPageNumber - 1) * entriesPerPage;
    let endEntryIndex = Math.min(entryCount, firstEntryIndex + entriesPerPage);

    return Object.freeze({
      entryCount: entryCount,
      entriesPerPage: entriesPerPage,
      pageCount: pages.length,
      numbers: pageNumbers,
      keys: pageKeys,

      currentPageNumber: currentPageNumber,
      hasPrevPage: currentPageNumber > 1,
      hasNextPage: currentPageNumber < pages.length,

      firstEntryIndex: firstEntryIndex,
      endEntryIndex: endEntryIndex,
      lastEntryIndex: endEntryIndex - 1,

      currentPageKey: getPageKey(currentPageNumber),
      currentPageUrl: getUrlForPageNumber(currentPageNumber),

      getPageKey: getPageKey,
      getPageNumber: getPageNumber,
      getUrlForPageKey: getUrlForPageKey,
      getUrlForPageNumber: getUrlForPageNumber,

      first() {
        return first;
      },
      next() {
        return this.hasNextPage
          ? createIterator(currentPageNumber + 1)
          : null;
      }
    });
  }


  return first;
}


function calculatePageCount(entriesPerPage: number, entryCount: number): number {
  return (entryCount * entriesPerPage !== 0)
    ? Math.ceil(entryCount / entriesPerPage)
    : 1;
}


/**
 * A function that gets the key and url associated with a given page number.
 *
 * @param pageNumber
 *   Number of the page.
 *
 * @returns
 *   An array containing the key and url of the format `[ pageKey, pageUrl ]`.
 */
export interface GetPageInfoFunction {
  (pageNumber: number): [string, string];
}
