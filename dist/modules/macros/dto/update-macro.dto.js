"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMacroDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_macro_dto_1 = require("./create-macro.dto");
class UpdateMacroDto extends (0, mapped_types_1.PartialType)(create_macro_dto_1.CreateMacroDto) {
}
exports.UpdateMacroDto = UpdateMacroDto;
//# sourceMappingURL=update-macro.dto.js.map