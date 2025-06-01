import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface Tag {
  id: number
  name: string
}

export const tagApi = createApi({
  reducerPath: 'tagApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api' }),
  endpoints: build => ({
    getAllTags: build.query<Tag[], void>({
      query: () => '/tags/',
    }),
  }),
})

export const { useGetAllTagsQuery } = tagApi
