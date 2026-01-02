"use client";

import Link from "next/link";

const AboutPage = () => {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-3">You have been logged out!</h1>

            <p className="text-lg text-gray-700 text-center mb-6">
                Please go to the <Link href="/auth/login" className="text-blue-500 hover:underline">login page</Link> to login again.
            </p>
        </div>
    );
};

export default AboutPage;