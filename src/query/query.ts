import { Optional } from "src/optional/optional";
import { SelectQueryBuilder } from "typeorm";

export abstract class SelectQuery<E> {

    private selectQueryBuilder: SelectQueryBuilder<E>
    
    constructor(selectQueryBuilder: SelectQueryBuilder<E>) {
        this.selectQueryBuilder =  selectQueryBuilder
    }

    public async getOne(): Promise<Optional<E>> {
        return new Optional<E>(await this.selectQueryBuilder.getOne())
    }

    public async getMany(): Promise<E[]> {
        return await this.selectQueryBuilder.getMany()
    }

    public async getCount(): Promise<number> {
        return await this.selectQueryBuilder.getCount()
    }

}
