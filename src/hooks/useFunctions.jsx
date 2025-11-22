const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export async function LoginUser(loginData) {
    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/LoginUser`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseKey}`
            },
            body: JSON.stringify(loginData),
        });
        return response;
    } catch (error) {
        console.error('Error in LoginUser:', error);
        throw error;
    }   
}

export async function RegisterUser(registerData) {
    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/RegisterUser`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseKey}`
            },
            body: JSON.stringify(registerData),
        });
        return response;
    } catch (error) {
        console.error('Error in RegisterUser:', error);
        throw error;
    }
}

export async function completeRegistration(data, email, name, phone, university, file) {
    const user_id = data.user_id;
    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/completeRegistration`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ 
                user_id, 
                email, 
                name, 
                phone, 
                university, 
            }),
        });
        return response;
    } catch (error) {
        console.error('Error in CompleteRegistration:', error);
        throw error;
    }
}

export async function EmailVerification(data) {
    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/EmailVerification`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({user_id: data.user_id}),
        });
        return response;
    } catch (error) {
        console.error('Sytem Error or Email not verified', error);
        throw error;
    }
}

export async function UploadTruckData(data){
    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/TruckData`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseKey}`
            },
            body: JSON.stringify(data),
        });
        return response;
    } catch (error) {
        console.error('Sytem Error or Email not verified', error);
        throw error;
    }
}