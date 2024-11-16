import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, Card, Checkbox, Label, TextInput } from 'flowbite-react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useProfile } from '@/services/profile';
import { useRouteContext } from '@tanstack/react-router';

const schema = yup
    .object({
        email: yup.string().email('Please enter a valid email').required('Email is required'),
        name: yup.string().min(4, 'Name must be at least 2 characters long').required('Name is required'),
        acceptTerms: yup
            .boolean()
            .oneOf([true], 'You must accept the terms and conditions')
            .required('You must accept the terms and conditions'),
    })
    .required();

type FormInputs = {
    email: string;
    name: string;
    acceptTerms: boolean;
};

export default function OnBoardingPage() {
    const { token, refreshUser } = useRouteContext({ strict: false });
    const { useOnboardUser } = useProfile({ token: token! });

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<FormInputs>({
        resolver: yupResolver(schema),
        mode: 'all',
    });

    const { mutateAsync, isPending } = useOnboardUser;

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        const profile = await mutateAsync({ ...data });
        if (refreshUser) await refreshUser(profile);
    };

    return (
        <div className="mx-auto mt-10 max-w-md">
            <Card>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <h2 className="mb-4 text-2xl font-bold">Welcome to Wallpaper</h2>
                        <p className="mb-4">Please provide your information to get started.</p>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="email" value="Your email" />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            placeholder="name@flowbite.com"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /\S+@\S+\.\S+/,
                                    message: 'Invalid email address',
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600" role="alert">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="name" value="Your name" />
                        </div>
                        <TextInput
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            {...register('name', {
                                required: 'Name is required',
                                minLength: {
                                    value: 2,
                                    message: 'Name must be at least 2 characters long',
                                },
                            })}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600" role="alert">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="acceptTerms"
                            {...register('acceptTerms', {
                                required: 'You must accept the terms and conditions',
                            })}
                        />
                        <Label htmlFor="acceptTerms" className="flex">
                            I agree to the{' '}
                            <a href="#" className="ml-1 text-blue-600 hover:underline">
                                terms and conditions
                            </a>
                        </Label>
                    </div>
                    {errors.acceptTerms && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                            {errors.acceptTerms.message}
                        </p>
                    )}
                    <Button type="submit" disabled={!isValid} isProcessing={isPending}>
                        Continue
                    </Button>
                </form>
            </Card>
        </div>
    );
}
