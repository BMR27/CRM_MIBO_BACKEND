interface Contacto {
    nombre: string;
    telefono: string;
}
import { TwilioService } from '../../twilio/twilio.service';
export declare class MessagesBulkController {
    private readonly twilioService;
    constructor(twilioService: TwilioService);
    uploadBulk(file: Express.Multer.File, body?: any, req?: any): Promise<{
        error: string;
        success?: undefined;
        rows?: undefined;
        results?: undefined;
        preview?: undefined;
    } | {
        success: boolean;
        rows: number;
        results: any[];
        preview: Contacto[];
        error?: undefined;
    }>;
}
export {};
//# sourceMappingURL=messages.bulk.controller.d.ts.map