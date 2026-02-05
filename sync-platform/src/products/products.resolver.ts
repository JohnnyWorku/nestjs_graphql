import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Mutation(() => Product)
  async createProduct(@Args('createProductInput') createProductInput: CreateProductInput): Promise<Product> {
    return await this.productsService.create(createProductInput);
  }

  @Query(() => [Product], { name: 'products' })
  async findAll(): Promise<Product[]> {
    return await this.productsService.findAll();
  }

  @Query(() => Product, { name: 'product', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Product> {
    return await this.productsService.findOne(id);
  }

  @Mutation(() => Product)
  async updateProduct(@Args('updateProductInput') updateProductInput: UpdateProductInput): Promise<Product> {
    return await this.productsService.update(updateProductInput.id, updateProductInput);
  }

  @Mutation(() => Boolean)
  async removeProduct(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return await this.productsService.remove(id);
  }
}