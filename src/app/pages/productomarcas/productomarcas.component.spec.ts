import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoMarcasComponent } from './productomarcas.component';

describe('ProductosComponent', () => {
  let component: ProductoMarcasComponent;
  let fixture: ComponentFixture<ProductoMarcasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoMarcasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoMarcasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
