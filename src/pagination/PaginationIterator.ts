// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


/**
 * An iterator that represents a page within a paginated sequence of entries.
 */
export interface PaginationIterator {

  /**
   * The total count of entries.
   */
  entryCount: number;

  /**
   * The maximum count of entries per page.
   */
  entriesPerPage: number;

  /**
   * The total count of pages.
   */
  pageCount: number;

  /**
   * An array of all the page numbers.
   */
  numbers: number[];

  /**
   * An array of all the page keys.
   */
  keys: string[];


  /**
   * The current page number.
   */
  currentPageNumber: number;

  /**
   * Indicates whether there is a page before the current page.
   */
  hasPrevPage: boolean;

  /**
   * Indicates whether there is a page after the current page.
   */
  hasNextPage: boolean;


  /**
   * Zero-based index of the first entry of the current page.
   */
  firstEntryIndex: number;

  /**
   * Zero-based index after last entry of the current page.
   */
  endEntryIndex: number;

  /**
   * Zero-based index of the last entry of the current page.
   */
  lastEntryIndex: number;


  /**
   * Key of the current page.
   */
  currentPageKey: string;

  /**
   * URL of the current page.
   */
  currentPageUrl: string;


  /**
   * Gets the key of a page from a given page number.
   *
   * @param pageNumber
   *   Number of the page to lookup.
   */
  getPageKey(pageNumber: any): string;

  /**
   * Gets the number of a page from a given key.
   *
   * @param pageKey
   *   Key of the page to lookup.
   */
  getPageNumber(pageKey: any): number;

  /**
   * Gets URL for a specified page by key.
   *
   * @param pageKey
   *   Key of the page to lookup.
   */
  getUrlForPageKey(pageKey: any): string;

  /**
   * Gets URL for a specified page number.
   *
   * @param pageNumber
   *   Number of the page to lookup.
   */
  getUrlForPageNumber(pageNumber: any): string;


  /**
   * Gets immutable iterator from first page in the paginated sequence.
   */
  first(): PaginationIterator;

  /**
   * Gets immutable iterator for next page in the paginated sequence.
   */
  next(): PaginationIterator;

}
