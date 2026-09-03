
export interface CreateCategoriesInterface{
    name: string
    isRecurrent?: boolean
}
export interface CategoriesResponse{
    name: string
    isRecurrent: boolean | null
    id: string
    status: string
    createdAt: Date
    UpdateAt: Date
    userId: string
}

export interface UpdateCategoryInterface {
    name?: string | null
    isRecurrent?: boolean | null
}
