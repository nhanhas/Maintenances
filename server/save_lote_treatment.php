<?php
error_reporting(E_ERROR | E_PARSE);
 //read parameters
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

//credentials
$credentials = $request->credentials;
//client
$lote = $request->lote;

$ch=doPhcFXLogin($credentials);

saveLote($ch, $credentials, $lote);

doPhcFXLogout($ch, $credentials);

function saveLote($ch, $credentials, $lote){
    $urlBase = $credentials->backendUrl;
    $usernameLogin = $credentials->username;
    $passwordLogin = $credentials->password;
    $appTypeLogin  = $credentials->appId;
    $companyLogin  = $credentials->company;

	$url = $urlBase . "REST/addon/u6526_lotesWS/Save";

	$params =  array('itemVO' => json_encode($lote),
	                  'runWarningRules' => 'false'
    							);
	$response=doPhcFXRequest($ch, $url,$params);
	//var_dump($response);

	if(isset($response['messages'][0]['messageCodeLocale'])){
        echo $response['messages'][0]['messageCodeLocale'] ;
        return false;
    }
    if(empty($response['result'])){
        echo "Ocorreu um erro a gravar o lote, tente mais tarde." ;
        return false;
    }
    $result = array();
    $result['success'] = true;

    echo json_encode( $result, true) ;


}
### GENERIC FUNCTIONS
function doPhcFXRequest($ch, $url,$params){
	// Build Http query using params
	$query = http_build_query ($params);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, false);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
	$response = curl_exec($ch);
	// send response as JSON
	return json_decode($response, true);
}

function doPhcFXLogin($request){
    $urlBase = $request->backendUrl;
    $usernameLogin = $request->username;
    $passwordLogin = $request->password;
    $appTypeLogin  = $request->appId;
    $companyLogin  = $request->company;
	/*************************************************************
	 *		 Called webservice that make login in Drive FX       *
	 *************************************************************/
	$url = $urlBase . "REST/UserLoginWS/userLoginCompany";
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
		return false;
	} else if(empty($response)){
		return false;
	} else if(isset($response['messages'][0]['messageCodeLocale'])){
		echo "Error in login. Please verify your username, password, applicationType and company." ;
		return false;
	}
	return $ch;
}

function doPhcFXLogout($ch, $request){
    $urlBase = $request->backendUrl;
    $usernameLogin = $request->username;
    $passwordLogin = $request->password;
    $appTypeLogin  = $request->appId;
    $companyLogin  = $request->company;
	/*******************************************************************
	*          Called webservice that makes logout of Drive FX         *
	********************************************************************/
	$url = $urlBase . "REST/UserLoginWS/userLogout";
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, false);
	$response = curl_exec($ch);
}

?>