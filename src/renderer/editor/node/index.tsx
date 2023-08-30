import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";

export const MoorSchema: Schema = new Schema({
    nodes: schema.spec.nodes,
    marks: schema.spec.marks
})