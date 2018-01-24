<?php  

    //read parameters
    $postdata = file_get_contents("php://input");
    $request = json_decode($postdata);


    $urlBase = $request->backendUrl;
    $usernameLogin = $request->username;
    $passwordLogin = $request->password;
    $appTypeLogin  = $request->appId;
    $companyLogin  = $request->company;


    //echo $urlBase . "    " . $usernameLogin . "    " . $passwordLogin . "    " . $appTypeLogin . "    " . $companyLogin;


    //developer test
	//$urlBase = 'https://developer.phcfx.com/app/';
	//$usernameLogin = 'parceiro';
	//$passwordLogin = 'parceiro2015';
	//$appTypeLogin  = 'D61151BF98';
	//$companyLogin  = 'Dev000001';

	/*************************************************************
	 *		 Called webservice that make login in Drive FX       *
	 *************************************************************/
	$url = $urlBase."REST/UserLoginWS/userLoginCompany";

	// Create map with request parameters
	$params = array('userCode' => $usernameLogin,
					'password' => $passwordLogin,
					'applicationType' => $appTypeLogin,
					'company' => $companyLogin
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
	} else if(empty($response)){
	} else if(isset($response['messages'][0]['messageCodeLocale'])){
		echo "Error in login. Please verify your username, password, applicationType and company.";
	} else {

        $result = json_encode($response['result'][0]);

        echo $result;


		//var_dump( $response['result'][0]);

	}

?> 