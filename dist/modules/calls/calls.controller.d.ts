import { VoiceService } from '../voice/voice.service';
export declare class CallsController {
    private voiceService;
    constructor(voiceService: VoiceService);
    getCalls(conversationId?: string): Promise<{
        calls: import("../voice/entities/call.entity").Call[];
    }>;
}
//# sourceMappingURL=calls.controller.d.ts.map