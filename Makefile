# Makefile for easy execution of task across team members and environments.
#
# Inspired by:
# - https://localheinz.com/blog/2018/01/24/makefile-for-lazy-developers/
# - https://blog.jessekramer.io/tutorial/2018/10/22/php-projects-and-make.html
#
# Based on:
# - https://github.com/nicwortel/symfony-skeleton/blob/master/Makefile
# - https://github.com/infection/infection/blob/master/Makefile
# - https://github.com/opencfp/opencfp/blob/master/Makefile
#

.DEFAULT_GOAL := help

# See https://tech.davis-hansson.com/p/make/
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

# Output any line in the form of `command:	\#\# Some description of the command
.PHONY: help
help:
	@echo "\033[33mUsage:\033[0m\n  make TARGET\n\n\033[32m#\n# Commands\n#---------------------------------------------------------------------------\033[0m\n"
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//' | awk 'BEGIN {FS = ":"}; {printf "\033[33m%s:\033[0m%s\n", $$1, $$2}'

#
# Variables
#---------------------------------------------------------------------------

#
# Commands (phony targets)
#---------------------------------------------------------------------------


#
# Local infrastructure
#---------------------------------------------------------------------------
.PHONY: run
run:	## Run the processing
run:
	$(info Running...)
	./dkr run

.PHONY: build
build:	## (re)Build the service
build:
	mkdir -p output
	docker-compose down
	docker-compose up -d --build
