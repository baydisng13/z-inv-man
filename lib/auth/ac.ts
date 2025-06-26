import { createAccessControl } from "better-auth/plugins/access";
import { statement } from "./statement";

export const ac = createAccessControl(statement); 
