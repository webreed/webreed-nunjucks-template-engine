// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


/**
 * An object representing paginated template output.
 */
export class Pagination {

  static calculatePageCount(entryCount: number, entriesPerPage: number): number {
    if (entryCount === 0 || entriesPerPage === 0) {
      return 1;
    }
    else {
      return Math.ceil(entryCount / entriesPerPage);
    }
  }


  private _pages: Array<[string, string]>;
  private _byIndex: string[];
  private _byKey: Map<string, string>;


  /**
   * @param entryCount
   *   Total count of entries represented by the pagination.
   * @param entriesPerPage
   *   Total count of entries per page.
   * @param pages
   *   Array of page key/url pairs.
   * @param currentPageIterator
   *   An object that keeps track of the current page number allowing the owner of the
   *   [[Pagination]] object to perform iteration without exposing the functionality to
   *   templates.
   */
  constructor(entryCount: number, entriesPerPage: number, pages: Array<[string, string]>, currentPageIterator: { number: number }) {
    console.assert(Pagination.calculatePageCount(entryCount, entriesPerPage) === pages.length,
        "length of 'pages' array is not consistent with entries");

    // Ensure that keys of argument 'pages' are strings.
    this._pages = <Array<[string, string]>> Array.from(pages, x => [ x[0].toString(), x[1] ]);

    this._byIndex = Array.from(pages, x => x[1]);
    this._byKey = new Map(pages);

    Object.defineProperty(this, "entryCount", {
      value: entryCount
    });

    Object.defineProperty(this, "entriesPerPage", {
      value: entriesPerPage
    });

    Object.defineProperty(this, "pageCount", {
      value: this._pages.length
    });

    Object.defineProperty(this, "numbers", {
      value: Object.freeze(Array.from(this._pages, (x, i) => i + 1))
    });

    Object.defineProperty(this, "keys", {
      value: Object.freeze(Array.from(this._pages, x => x[0]))
    });

    Object.defineProperty(this, "currentPageNumber", {
      get: () => currentPageIterator.number
    });

    Object.defineProperty(this, "currentPageKey", {
      get: () => this.getPageKey(currentPageIterator.number)
    });

    Object.defineProperty(this, "currentPageUrl", {
      get: () => this.getUrlForPageNumber(currentPageIterator.number)
    });
  }

  /**
   * Indicates whether there is a previous page relative to the current page.
   */
  get hasPrevPage(): boolean {
    return this.currentPageNumber > 1;
  }

  /**
   * Indicates whether there is a next page relative to the current page.
   */
  get hasNextPage(): boolean {
    return this.currentPageNumber < this.pageCount;
  }

  /**
   * Zero-based index of the first entry of the current page.
   */
  get firstEntryIndex(): number {
    return (this.currentPageNumber - 1) * this.entriesPerPage;
  }

  /**
   * Zero-based index after last entry of the current page.
   */
  get endEntryIndex(): number {
    return Math.min(this.entryCount, this.firstEntryIndex + this.entriesPerPage);
  }

  /**
   * Zero-based index of the last entry of the current page.
   */
  get lastEntryIndex(): number {
    return this.endEntryIndex - 1;
  }

  /**
   * Gets the key of a page from a given page number.
   */
  public getPageKey(pageNumber: number | string): string {
    let n = parseInt(<any>pageNumber);

    console.assert(n > 0 && n <= this.pageCount,
        `page number '${n}' out of range`);

    return this.keys[n - 1];
  }

  /**
   * Gets the number of a page from a given key.
   */
  public getPageNumber(pageKey: string): number {
    pageKey = pageKey.toString();

    let keyIndex = this.keys.indexOf(pageKey);
    console.assert(keyIndex !== -1,
        `page key '${pageKey}' was not found`);

    return keyIndex + 1;
  }

  /**
   * Gets URL for a specified page by key.
   */
  public getUrlForPageKey(pageKey: number | string): string {
    let k = pageKey.toString();

    let url = this._byKey.get(k);

    console.assert(url !== undefined,
        `page key '${k}' was not found`);

    return url;
  }

  /**
   * Gets URL for a specified page number.
   */
  public getUrlForPageNumber(pageNumber: number | string): string {
    let pageIndex = parseInt(<any>pageNumber) - 1;

    console.assert(pageIndex >= 0 && pageIndex < this.pageCount,
        `page number '${pageNumber}' out of range`);

    return this._byIndex[pageIndex];
  }

}


export declare interface Pagination {

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
  numbers: [number];

  /**
   * An array of all the page keys.
   */
  keys: [string];

  /**
   * Teh current page number.
   */
  currentPageNumber: number;

  /**
   * The current page key.
   */
  currentPageKey: string;

  /**
   * The current page URL.
   */
  currentPageUrl: string;

}
