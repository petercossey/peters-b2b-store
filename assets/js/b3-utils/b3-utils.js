/*
 * Utilities for BundleB2B Storefront API access
 */
const B3_APP_ID = 'dl7c39mdpul6hyc489yk0vzxl6jesyx';

async function getBcToken(appId = B3_APP_ID) {
    try {
        let customToken = await fetch(`/customer/current.jwt?app_client_id=${appId}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then((response) => response.json())
        .then((data) => {
            return data.token
        })
        .catch(error => console.log('error', error))

        return await customToken

    } catch(error) {
        console.log(error)
    }
}

async function getB3Token(customerId, customerToken, storeHash) {
    try {
        // network request
        let b3Token = await fetch(`https://api.bundleb2b.net/api/v2/login`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'bcToken': customerToken,
                'customerId': customerId,
                'storeHash': storeHash
            })
        })
        .then(response => response.json())
        .then(data => {
            return data.data.token;
        })
        .catch(error => console.log('Error:', error))

        return await b3Token

    } catch(error) {
        console.log(error)
    }
}

async function getB3UserInfo(userId, b3Token) {
    try {
        const options = {method: 'GET', headers: {'Content-Type': 'application/json', authToken: b3Token}};

        const b3User = await fetch(`https://api.bundleb2b.net/api/v2/users/${userId}?` + new URLSearchParams({
            isBcId: '1'
        }), options)
            .then(response => response.json())
            .then(response => {
                return response.data;
            })
            .catch(err => console.error(err));

        return await b3User;
        
    } catch(error) {
        console.log('There was an error requesting B3 user info', error);
    }
}

async function getB3Company(b3UserId, b3Token) {
    try {
        const options = {method: 'GET', headers: {'Content-Type': 'application/json', authToken: b3Token}};

        const company = await fetch(`https://api.bundleb2b.net/api/v2/customers/${b3UserId}/companies`, options)
        .then(response => response.json())
        .then(response => {
            return response.data;
        })
        .catch(err => console.error(err));

        return await company;

    } catch(error) {
        console.log('There was an error requesting b3 company info');
    }
}

async function updateActiveCurrency(companyCurrency, currency_selector, cartId) {
    const cartHasItems = cartId !== '';
    
    // change currency to companyCurrency
    if (cartHasItems) {
        await updateCartCurrency(companyCurrency, cartId);
        updateStoreCurrency(companyCurrency, currency_selector)
    } else {
        updateStoreCurrency(companyCurrency, currency_selector)
    }

}

async function updateCartCurrency(newCurrency, cartId) {
     // need to use the Update Cart Currency API
     try {
        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: `{"currencyCode":"${newCurrency}"}`
          };
          
        const updateCartCurrency = await fetch(`/api/storefront/carts/${cartId}/currency`, options)
        .then(response => response.json())
        .then(response => {
            return response;
        })
        .catch(err => console.error(err));

        console.log('Cart currency updated to: ' + newCurrency);
        return await updateCartCurrency;

    } catch(error) {
        console.log('There was an error updating cart currency', error);
    }
}

function updateStoreCurrency(newCurrency, currency_selector) {
    // loop through currency_selector.currencies and use the switch_url.
    currency_selector.currencies.forEach(element => {
        if (newCurrency === element.code)
            window.location.href = element.switch_url;
    });
}