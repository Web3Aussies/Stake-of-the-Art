import { useAssets } from '@/services/assets';
import { useNavigate, useParams, useRouteContext } from '@tanstack/react-router';
import { IDKitWidget, ISuccessResult, VerificationLevel } from '@worldcoin/idkit';

import { Button, Card } from 'flowbite-react';
import { useState } from 'react';

export default function SignWallpaperPage() {
    const [checked, setChecked] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams({ from: '/app/assets/$id/sign' });
    const { token } = useRouteContext({ strict: false });

    const { SignAsset } = useAssets({ token });
    const { mutateAsync, isPending } = SignAsset;

    const onSuccess = async (r: ISuccessResult) => {
        await mutateAsync({ id, ...r });
        navigate({ to: '/app' });
    };

    return (
        <Card className="mx-auto mt-52 w-full max-w-md">
            <form className="flex flex-col gap-4">
                <div>
                    <p className="mb-4">
                        I hereby declare that I own or have rights to publish this image as wallpaper.
                    </p>
                    <div className="flex items-center gap-2">
                        <input
                            checked={checked}
                            onChange={(e) => setChecked(e.currentTarget.checked)}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 bg-gray-100 focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="acknowledge" className="text-sm font-medium">
                            I acknowledge and agree to the above statement
                        </label>
                    </div>
                </div>
                <div className="flex justify-center">
                    <IDKitWidget
                        app_id={import.meta.env.VITE_APP_ID} // obtained from the Developer Portal
                        action="attest_wallpaper" // this is your action name from the Developer Portal
                        signal={id} // any arbitrary value the user is committing to, e.g. a vote
                        onSuccess={onSuccess}
                        
                        verification_level={VerificationLevel.Device} // minimum verification level accepted, defaults to "orb"
                    >
                        {({ open }) => (
                            <Button type="button" onClick={open} disabled={!checked} size="lg">
                                Sign
                            </Button>
                        )}
                    </IDKitWidget>
                </div>
            </form>
        </Card>
    );
}
