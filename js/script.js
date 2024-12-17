function togglePasswordVisibility(passwordFieldId) {
    const passwordField = document.getElementById(passwordFieldId);
    const checkbox = document.getElementById(`show-${passwordFieldId}`);
    passwordField.type = checkbox.checked ? 'text' : 'password';
}

function toggleFields() {
    const authType = document.getElementById('auth-type').value;
    const personalFields = document.getElementById('personal-fields');
    const enterpriseFields = document.getElementById('enterprise-fields');

    if (authType === 'WPA2-Personal') {
        personalFields.style.display = 'block';
        enterpriseFields.style.display = 'none';
    } else {
        personalFields.style.display = 'none';
        enterpriseFields.style.display = 'block';
    }
}

async function fetchConfig() {
    try {
        const response = await fetch('/fs/config.json');
        const config = await response.json();

        if (config.network.wifi.eap.method === 'PEAP') {
            document.getElementById('auth-type').value = 'WPA2-Enterprise';
            toggleFields();

            document.getElementById('enterprise-ssid').value = config.network.wifi.ssid || '';
            document.getElementById('eap-username').value = config.network.wifi.eap.username || '';
            document.getElementById('eap-password').value = config.network.wifi.eap.password || '';
        } else {
            document.getElementById('auth-type').value = 'WPA2-Personal';
            toggleFields();

            document.getElementById('wifi-ssid').value = config.network.wifi.ssid || '';
            document.getElementById('wifi-password').value = config.network.wifi.password || '';
        }
    } catch (error) {
        alert('Failed to fetch config: ' + error.message);
    }
}

async function saveConfig() {
    if (!validateForm()) return;

    try {
        const authType = document.getElementById('auth-type').value;
        let updatedConfig;

        if (authType === 'WPA2-Personal') {
            updatedConfig = {
                network: {
                    wifi: {
                        ssid: document.getElementById('wifi-ssid').value,
                        password: document.getElementById('wifi-password').value,
                        eap: {
                            method: null,
                            identity: null,
                            client_cert: null,
                            client_key: null,
                            server_cert: null,
                            username: null,
                            password: null,
                        },
                    },
                },
            };
        } else {
            updatedConfig = {
                network: {
                    wifi: {
                        ssid: document.getElementById('enterprise-ssid').value,
                        password: null,
                        eap: {
                            method: 'PEAP',
                            identity: 'EAP',
                            client_cert: null,
                            client_key: null,
                            server_cert: null,
                            username: document.getElementById('eap-username').value,
                            password: document.getElementById('eap-password').value,
                        },
                    },
                },
            };
        }

        const response = await fetch('/fs/config.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedConfig),
        });

        if (response.ok) {
            alert('Config saved successfully!');
        } else {
            alert('Failed to save config: ' + response.statusText);
        }
    } catch (error) {
        alert('Error saving config: ' + error.message);
    }
}

function validateForm() {
    const authType = document.getElementById('auth-type').value;

    if (authType === 'WPA2-Personal') {
        const ssid = document.getElementById('wifi-ssid').value;
        const password = document.getElementById('wifi-password').value;

        if (!ssid || !password) {
            alert('Please fill in all required fields for WPA2-Personal');
            return false;
        }
    }

    if (authType === 'WPA2-Enterprise') {
        const ssid = document.getElementById('enterprise-ssid').value;
        const username = document.getElementById('eap-username').value;
        const password = document.getElementById('eap-password').value;

        if (!ssid || !username || !password) {
            alert('Please fill in all required fields for WPA2-Enterprise');
            return false;
        }
    }

    return true;
}

window.onload = fetchConfig;
