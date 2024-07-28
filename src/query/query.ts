import { Optional } from "src/optional/optional";
import { SelectQueryBuilder } from "typeorm";

// SCRIVIAMO UN PAIO DI QUERY CON TYPEORM

// Qui ho creato una classe astratta per facilitare il  recupero dei risultati 
// ottenuti tramite query in lettura, ovvero SELECT
// Da notare che ho riprodotto un oggetto Optional molto simile all'oggetto Optional di Java
// che funziona da wrapper impedendo che si scatenino errori di runtime dovuti all'ottenimento di valori nulli dalla query

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
