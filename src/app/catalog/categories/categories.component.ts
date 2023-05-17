import { DOCUMENT } from "@angular/common";
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, NgZone, Output, ViewChild } from "@angular/core";
import { BehaviorSubject, distinctUntilChanged, filter } from "rxjs";
import { StyleService } from "src/app/utils/styles/styles.service";
import { MatMenuDirective } from "../../material/mat-menu/mat-menu.directive";
import { IProductCategory } from "../../products/product";

@Component({
  selector: 'app-categories',
  templateUrl: 'categories.component.html',
  styleUrls: ['categories.component.sass']
})
export class CategoriesListComponents {
  @ViewChild('scrollableContainer') scrollableDiv!: ElementRef<HTMLDivElement>
  private _categories = new BehaviorSubject<IProductCategory[]>([])
  private _selectedCategory = new BehaviorSubject<IProductCategory | undefined>(undefined)
  private _parentCategory = new BehaviorSubject<IProductCategory | undefined>(undefined)
  private _selectedCategoryId?: string

  public readonly categories$ = this._categories.asObservable()
  public readonly selectedCategory$ = this._selectedCategory.asObservable()
  public readonly parentCategory$ = this._parentCategory.asObservable()
  public showsubcategory = false

  @ViewChild(MatMenuDirective) matMenu!: MatMenuDirective
  @Output('select') onSelectCategory: EventEmitter<IProductCategory> = new EventEmitter<IProductCategory>()
  @Input('categories') set categories(categories: IProductCategory[]) {
    this._categories.next(categories)
  }
  @Input('selectedCategoryId') set selectedCategoryId(value: string | undefined) {
    this._selectedCategoryId = value

    if (value)
      setTimeout(() => this.isFocusedCheck(value), 500)

    this._cdr.detectChanges()
  }

  get selectedCategoryId(): string | undefined {
    return this._selectedCategoryId
  }

  set selectedCategory(category: IProductCategory | undefined) {
    if (category) {
      this._selectedCategory.next(category)
      this._cdr.detectChanges()
    }
  }

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _cdr: ChangeDetectorRef,
    private _zone: NgZone,
    styleService: StyleService
  ) {
    styleService.loadStyle('mat-menu')
    this._cdr.detach()
  }

  private isFocusedCheck(id: string) {
    this._zone.runOutsideAngular(() => {
      const ul: HTMLElement | null = this._document.getElementById('categories-list')
      const li: HTMLElement | null = this._document.getElementById(`categories-list-${id}`)

      if (ul && li) {
        if (ul.scrollWidth - ul.clientWidth > 0) {
          const ulViewSize = ul.scrollLeft + ul.clientWidth
          const liViewSize = li.offsetLeft + li.clientWidth

          if (ulViewSize < liViewSize)
            ul.scrollTo({ left: ul.scrollLeft + liViewSize - ulViewSize, behavior: "smooth" })
          else
            if (li.offsetLeft < ul.scrollLeft)
              ul.scrollTo({ left: ul.scrollLeft - (ul.scrollLeft - li.offsetLeft), behavior: "smooth" })
        }
      }
    })
  }

  public isCategorySelected(category: IProductCategory): boolean {
    return (category._id === this.selectedCategoryId) || (category.children && category.children.findIndex(item => item._id === this.selectedCategoryId) >= 0)
  }

  public getSelectedChildCategory(category: IProductCategory): IProductCategory | undefined {
    const index = category.children.findIndex(item => item._id === this.selectedCategoryId)
    return index >= 0 ? category.children[index] : undefined
  }

  public onClickSelectCategory(category: IProductCategory, event?: MouseEvent): void {
    if (category.children && category.children.length > 0) {
      if (this.matMenu && event) {
        const left = (event.currentTarget as HTMLButtonElement).offsetLeft - this.scrollableDiv.nativeElement.scrollLeft
        this.matMenu.show(left)
      }

      this._parentCategory.next(category)
      this._cdr.detectChanges()

    } else {
      this.selectedCategory = category
      this.selectedCategoryId = category._id

      if (this.matMenu)
        this.matMenu.close()
    }
  }


  public next(): IProductCategory {
    let index = this._categories.value.findIndex(category => {
      return (category._id === this.selectedCategoryId) || (category.children && category.children.findIndex(item => item._id === this.selectedCategoryId) >= 0)
    })
    index++
    const response = this._categories.value[index] ? this._categories.value[index] : this._categories.value[0]
    this.selectedCategory = response
    return response
  }

  public prev(): IProductCategory {
    let index = this._categories.value.findIndex(category => {
      return (category._id === this.selectedCategoryId) || (category.children && category.children.findIndex(item => item._id === this.selectedCategoryId) >= 0)
    })
    index--
    const response = this._categories.value[index] ? this._categories.value[index] : this._categories.value[this._categories.value.length - 1]
    this.selectedCategory = response
    return response
  }

  ngAfterViewInit() {
    this.categories$.pipe(
      distinctUntilChanged(),
      filter(value => value.length > 0)
    ).subscribe(() => this._cdr.detectChanges())

    this.selectedCategory$.pipe(
      distinctUntilChanged(),
      filter(value => value ? true : false),
    ).subscribe(value => {
      this.onSelectCategory.emit(value!)
    })
  }

  ngOnInit(): void {
    this._cdr.detectChanges()
  }
}