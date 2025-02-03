import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = process.cwd() +"/"+ process.env.PROTO_PATH;

class GrpcClient {
    private static instance: GrpcClient;
    private client: any;

    private constructor() {
        // Load the protobuf
        console.log(PROTO_PATH);
        const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });

        // Load the package definition
        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

        // Get the audio service
        const AudioService = protoDescriptor.audio.AudioService;

        // Create a new client instance
        this.client = new AudioService(process.env.GRPC_SERVER, grpc.credentials.createInsecure());
    }

    public static getInstance(): GrpcClient {
        if (!GrpcClient.instance) {
            GrpcClient.instance = new GrpcClient();
        }
        return GrpcClient.instance;
    }

    public getClient() {
        return this.client;
    }
}

export default GrpcClient.getInstance();