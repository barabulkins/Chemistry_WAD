/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChemicalSamplesService {
    /**
     * @param gasVolume
     * @returns any
     * @throws ApiError
     */
    public static chemicalSamplesControllerGetAll(
        gasVolume: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/technical-samples',
            query: {
                'gas_volume': gasVolume,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static chemicalSamplesControllerGetDraft(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/technical-samples/draft',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static chemicalSamplesControllerCreateDraft(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/technical-samples/draft',
        });
    }
    /**
     * @param next
     * @returns any
     * @throws ApiError
     */
    public static chemicalSamplesControllerGetFeed0(
        next: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/technical-samples/feed',
            query: {
                'next': next,
            },
        });
    }
    /**
     * @param id
     * @param next
     * @returns any
     * @throws ApiError
     */
    public static chemicalSamplesControllerGetFeed1(
        id: string,
        next: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/technical-samples/feed/{id}',
            path: {
                'id': id,
            },
            query: {
                'next': next,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static chemicalSamplesControllerPublishDraft(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/technical-samples/publish',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static chemicalSamplesControllerDeleteSample(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/technical-samples/{id}/delete',
            path: {
                'id': id,
            },
        });
    }
}
