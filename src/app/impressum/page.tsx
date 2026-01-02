"use client";

const AboutPage = () => {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-3">Impressum</h1>

            <p className="text-lg text-gray-700 text-center mb-6">
                Felix Mausberg<br />
                Breite Stra&szlig;e 33a<br />
                41460 Neuss
            </p>

            <h2 className="text-3xl font-bold text-center mb-3">Kontakt</h2>
            <p className="text-lg text-gray-700 text-center mb-6">
                Telefon: +4915221886204<br />
                E-Mail: felix.mausberg@gmail.com
            </p>

            <p className="text-lg text-gray-700 text-center">
                Quelle: <a href="https://www.e-recht24.de">https://www.e-recht24.de</a>
            </p>
        </div>
    );
};

export default AboutPage;