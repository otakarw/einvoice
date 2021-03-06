package config

import (
	"time"

	"github.com/sirupsen/logrus"
)

var devConfig = Configuration{
	Port: 8080,
	Urls: Urls{
		ApiServer:      "http://localhost:8081",
		UpvsLogin:      "https://dev.upvs.einvoice.mfsr.sk/login?callback=http://localhost:3000/login-callback",
		LogoutCallback: "http://localhost:3000/logout-callback",
	},
	ClientBuildDir:     "web-app/build",
	LogLevel:           logrus.DebugLevel,
	ServerReadTimeout:  15 * time.Second,
	ServerWriteTimeout: 15 * time.Second,
	GracefulTimeout:    10 * time.Second,
}

var prodConfig = Configuration{
	Port: 80,
	Urls: Urls{
		UpvsLogin: "https://dev.upvs.einvoice.mfsr.sk/login?callback=https://dev.einvoice.mfsr.sk/login-callback",
		LogoutCallback: "https://dev.einvoice.mfsr.sk/logout-callback",
	},
	ClientBuildDir:     "/app/build",
	LogLevel:           logrus.InfoLevel,
	ServerReadTimeout:  15 * time.Second,
	ServerWriteTimeout: 15 * time.Second,
	GracefulTimeout:    10 * time.Second,
}
