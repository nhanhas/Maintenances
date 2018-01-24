<?php

    //read parameters
    $postdata = file_get_contents("php://input");
    $request = json_decode($postdata);

    //credentials
    $credentials = $request->credentials;
    //products
    $invoice = $request->invoice;
    //invoice option
    $option = $request->option;


    //var_dump($products);


    // #1 - Make a login request to validate Credentials
    $ch = doDriveLogin($credentials);

    // #3 - Finally, make the invoice
    $ch = doInvoiceProcess($ch, $credentials, $invoice);

    echo " ";

    /*************************************************************
    *		 Called webservice that make login in Drive FX       *
    *************************************************************/
    function doDriveLogin($credentials){

    	$url = $credentials->backendUrl . 'REST/UserLoginWS/userLoginCompany';

    	// Create map with request parameters
    	$params = array('userCode' => $credentials->username,
    					'password' => $credentials->password,
    					'applicationType' => $credentials->appId,
    					'company' => $credentials->company
    					);

    	// Build Http query using params
    	$query = http_build_query ($params);

    	//initial request with login data
    	$ch = curl_init();

    	//URL to save cookie "ASP.NET_SessionId"
    	curl_setopt($ch, CURLOPT_URL, $url);
    	curl_setopt($ch, CURLOPT_USERAGENT,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/32.0.1700.107 Chrome/32.0.1700.107 Safari/537.36');
    	curl_setopt($ch, CURLOPT_POST, true);
    	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    	//Parameters passed to POST
    	curl_setopt($ch, CURLOPT_POSTFIELDS, $query);
    	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    	curl_setopt($ch, CURLOPT_COOKIESESSION, true);
    	curl_setopt($ch, CURLOPT_COOKIEJAR, '');
    	curl_setopt($ch, CURLOPT_COOKIEFILE, '');
    	$response = curl_exec($ch);

    	// send response as JSON
    	$response = json_decode($response, true);

    	if (curl_error($ch)) {
    		return false;
    	} else if(empty($response)){
    		return false;
    	} else if(isset($response['messages'][0]['messageCodeLocale'])){
    		echo "Error in login. Please verify your username, password, applicationType and company." ;
    		return false;
    	}

    	return $ch;
    }

    function doPhcFXLogout($credentials, $ch){
    	/*******************************************************************
    	*          Called webservice that makes logout of Drive FX         *
    	********************************************************************/
    	$url = $credentials->backendUrl . 'REST/UserLoginWS/userLogout';
    	curl_setopt($ch, CURLOPT_URL, $url);
    	curl_setopt($ch, CURLOPT_POST, false);
    	$response = curl_exec($ch);
    }




    /*************************************************************
    *						 Invoice Process  				    *
    *************************************************************/
    function doInvoiceProcess($ch, $credentials, $invoice){

        	$ftNewInstance = $invoice;

        	// #2.3 - actEntity for Fis
        	$url = $credentials->backendUrl . '/REST/FtWS/actEntity';
            $params =  array ('entity' => json_encode($ftNewInstance),
                                            'code' => 0,
                                            'newValue' => json_encode([]));

            $response=doDriveRequest($ch, $url, $params);


            if(isset($response['messages'][0]['messageCodeLocale'])){
                echo "Error: " . $response['messages'][0]['messageCodeLocale'] ;
                return false;
            }

            $ftNewInstance = $response['result'][0];



            // #2.4 - Save Ft
            $url = $credentials->backendUrl . '/REST/FtWS/Save';
            $params =  array(   'itemVO' => json_encode($ftNewInstance),
            				    'runWarningRules' => 'false'
           						);

            $response=doDriveRequest($ch, $url, $params);

            if(isset($response['messages'][0]['messageCodeLocale'])){
                echo "Error: " . $response['messages'][0]['messageCodeLocale'] ;
                return false;
            }

            $ftNewInstance = $response['result'][0];
return $ch;
            // #2.5 - sign!
            if($ftNewInstance['draftRecord'] == 1){
                $url = $credentials->backendUrl . '/REST/FtWS/signDocument';
                $params =  array ('ftstamp' => $ftNewInstance['ftstamp']);

                $response=doDriveRequest($ch, $url, $params);

                if(isset($response['messages'][0]['messageCodeLocale'])){
                    echo "Error: " . $response['messages'][0]['messageCodeLocale'] ;
                    return false;
                }

                $ftNewInstance = $response['result'][0];

                return $ch;
            }

            return $ch;

    }


    /*************************************************************
    *		 Called webservice that make a request - GENERIC     *
    *************************************************************/
    function doDriveRequest($ch, $url,$params){

    	// Build Http query using params
    	$query = http_build_query ($params);

    	curl_setopt($ch, CURLOPT_URL, $url);
    	curl_setopt($ch, CURLOPT_POST, false);
    	curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
    	$response = curl_exec($ch);

    	// send response as JSON
    	return json_decode($response, true);
    }

?>