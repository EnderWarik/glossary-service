import { GlossaryServiceClient } from './gen/glossary_pb_service'
import * as pb from './gen/glossary_pb'

const GRPC_WEB_ENDPOINT = (import.meta.env.VITE_GRPC_WEB_ENDPOINT as string) || 'http://localhost:8081'
const client = new GlossaryServiceClient(GRPC_WEB_ENDPOINT)

export interface SourceInfo { title?: string; authors?: string; year?: number; link?: string }
export type TermObj = pb.Term.AsObject
export interface TermCreate { term: string; definition: string; synonyms?: string[]; tags?: string[]; source?: SourceInfo }
export interface TermUpdate extends Partial<TermCreate> {}

function unary<Req, Res>(fn: (req: Req, metadata: {} | undefined, cb: (err: any, resp: Res) => void) => any, req: Req): Promise<Res> {
    return new Promise((resolve, reject) => {
        fn.call(client, req, undefined, (err: any, resp: Res) => {
            if (err) reject(err)
            else resolve(resp)
        })
    })
}

export async function listTerms(query?: string): Promise<pb.Term.AsObject[]> {
    const req = new pb.ListTermsRequest()
    if (query) req.setQuery(query)
    const res = await unary<pb.ListTermsRequest, pb.ListTermsResponse>(client.listTerms, req)
    return res.toObject().itemsList
}

export async function getByKeyword(keyword: string): Promise<pb.Term.AsObject> {
    const req = new pb.TermByKeywordRequest()
    req.setKeyword(keyword)
    const res = await unary<pb.TermByKeywordRequest, pb.Term>(client.getTermByKeyword, req)
    return res.toObject()
}

export async function createTerm(data: TermCreate): Promise<pb.Term.AsObject> {
    const req = new pb.CreateTermRequest()
    req.setTerm(data.term)
    req.setDefinition(data.definition)
    if (data.synonyms) req.setSynonymsList(data.synonyms)
    if (data.tags) req.setTagsList(data.tags)
    if (data.source) {
        const s = new pb.SourceInfo()
        s.setTitle(data.source.title || '')
        s.setAuthors(data.source.authors || '')
        s.setYear((data.source.year ?? 0))
        s.setLink(data.source.link || '')
        req.setSource(s)
    }
    const res = await unary<pb.CreateTermRequest, pb.Term>(client.createTerm, req)
    return res.toObject()
}

export async function updateTerm(id: number, data: TermUpdate): Promise<pb.Term.AsObject> {
    const req = new pb.UpdateTermRequest()
    req.setId(id)
    if (data.term !== undefined) req.setTerm(data.term)
    if (data.definition !== undefined) req.setDefinition(data.definition)
    if (data.synonyms !== undefined) req.setSynonymsList(data.synonyms)
    if (data.tags !== undefined) req.setTagsList(data.tags)
    if (data.source) {
        const s = new pb.SourceInfo()
        if (data.source.title !== undefined) s.setTitle(data.source.title)
        if (data.source.authors !== undefined) s.setAuthors(data.source.authors)
        if (data.source.year !== undefined) s.setYear(data.source.year)
        if (data.source.link !== undefined) s.setLink(data.source.link)
        req.setSource(s)
    }
    const res = await unary<pb.UpdateTermRequest, pb.Term>(client.updateTerm, req)
    return res.toObject()
}

export async function deleteTerm(id: number): Promise<void> {
    const req = new pb.DeleteTermRequest()
    req.setId(id)
    await unary<pb.DeleteTermRequest, pb.Empty>(client.deleteTerm, req)
}

export interface RelationObj { id: number; source_id: number; target_id: number; type: string }
export async function getGraph(): Promise<{ nodes: pb.Term.AsObject[]; edges: pb.Relation.AsObject[] }> {
    const res = await unary<pb.Empty, pb.Graph>(client.getGraph, new pb.Empty())
    const obj = res.toObject()
    return { nodes: obj.nodesList as any, edges: obj.edgesList as any }
}

export async function createRelationApi(data: { source_id: number; target_id: number; type: string }) {
    const req = new pb.CreateRelationRequest()
    req.setSourceId(data.source_id)
    req.setTargetId(data.target_id)
    req.setType(data.type)
    const res = await unary<pb.CreateRelationRequest, pb.Relation>(client.createRelation, req)
    return res.toObject() as any
}

export async function updateRelation(id: number, data: Partial<{ source_id: number; target_id: number; type: string }>) {
    const req = new pb.UpdateRelationRequest()
    req.setId(id)
    if (data.source_id !== undefined) req.setSourceId(data.source_id)
    if (data.target_id !== undefined) req.setTargetId(data.target_id)
    if (data.type !== undefined) req.setType(data.type)
    const res = await unary<pb.UpdateRelationRequest, pb.Relation>(client.updateRelation, req)
    return res.toObject() as any
}

export async function deleteRelation(id: number) {
    const req = new pb.DeleteRelationRequest()
    req.setId(id)
    await unary<pb.DeleteRelationRequest, pb.Empty>(client.deleteRelation as any, req)
}

export async function listRelations() {
    const res = await unary<pb.Empty, pb.ListRelationsResponse>(client.listRelations as any, new pb.Empty())
    return res.toObject().itemsList as any
}
