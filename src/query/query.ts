import { Optional } from "src/optional/optional";
import { SelectQueryBuilder } from "typeorm";

export abstract class SelectQuery<E> {

    public async getOne(selectQueryBuilder: SelectQueryBuilder<E>): Promise<Optional<E>> {
        return new Optional<E>(await selectQueryBuilder.getOne())
    }

    public async getMany(selectQueryBuilder: SelectQueryBuilder<E>): Promise<E[]> {
        return await selectQueryBuilder.getMany()
    }

    public async getCount(selectQueryBuilder: SelectQueryBuilder<E>): Promise<number> {
        return await selectQueryBuilder.getCount()
    }

}
