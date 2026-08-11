import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        console.log(params);
        console.log(token);

        if (token) {
            localStorage.setItem('access_token', token);
            navigate("/dashboard", { replace: true });
        }
        else {
            navigate("/login", { replace: true });
        }

    }, [navigate]);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100vh', background: '#0a0a0f', color: '#9090b0',
            fontSize: '15px', gap: '12px'
        }}>
            <span style={{
                display: 'inline-block', width: 20, height: 20,
                border: '2px solid #6c63ff', borderTopColor: 'transparent',
                borderRadius: '50%', animation: 'spin 1s linear infinite'
            }} />
            Signing you in...
        </div>
    );
}