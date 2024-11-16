import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';
import { Button } from 'flowbite-react';
import { Link, useNavigate, useRouteContext } from '@tanstack/react-router';
import { useAssets } from '@/services/assets';

export default function NewWallpaperPage() {
    const { token } = useRouteContext({ strict: false });
    const navigate = useNavigate();
    const { useUploadImage } = useAssets({ token });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [file, setFile] = useState<globalThis.File | null>(null);

    const onDrop = useCallback((acceptedFiles: globalThis.File[]) => {
        const image = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(String(reader.result));
        };
        reader.readAsDataURL(image);
        setFile(image);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
        },
        multiple: false,
    });

    const { mutateAsync, isPending } = useUploadImage;

    const handleSubmit = async () => {
        if (file) {
            var assetId = await mutateAsync({ file });
            if (assetId) {
                navigate({ to: '/app/assets/$id/sign', params: { id: assetId } });
            }
        }
    };

    const handleReset = () => {
        setSelectedImage(null);
    };

    return (
        <div className="px-2 py-4">
            <div className="flex items-center justify-center">
                <div className="rounded-lg p-8 shadow-md">
                    <h2 className="mb-4 text-2xl">Upload New Wallpaper</h2>
                    {!selectedImage && (
                        <div className="flex flex-col gap-4">
                            <div
                                {...getRootProps()}
                                className="dropzone rounded-md border-2 border-dashed border-gray-300 p-6 text-center"
                            >
                                <input {...getInputProps()} />
                                <p className="text-gray-600">Drag 'n' drop an image here, or click to select one</p>
                            </div>
                            <Link to="/app" className="text-xl hover:underline">
                                Cancel
                            </Link>
                        </div>
                    )}
                    {selectedImage && (
                        <div className="flex flex-col gap-2">
                            <img src={selectedImage} alt="" className="rounded-md sm:max-w-96" />
                            <div className="flex gap-2">
                                <Button type="button" color="green" isProcessing={isPending} onClick={handleSubmit}>
                                    Upload
                                </Button>
                                <Button type="button" onClick={handleReset}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
