var objTodo = angular.module('objTodo', []);

function countTodoType(todo_type, json_object){
	var cnt = 0;
	for(todo in json_object){
		if(json_object[todo].todo_type == todo_type){
			cnt++;
		}
	}
	return cnt;
}

// follows YYYY-MM-DD pattern
function parseDate(input){
	if(input=='' || input==null) return input;
	var dateRegex = /([0-9]+-[0-9]{2}-[0-9]{2})/
	displayDate = dateRegex.exec(input)[1];
	return displayDate;
}

objTodo.filter('searchFilterer', function(){
    return function(input, search){
        if(search == null || search == "")
            return input;
            
        var out = [];
        for(var entry in input){
            if(input[entry].title.indexOf(search) == 0){
                out.push(input[entry]);
            }
        }  
        return out;
    }
});

objTodo.filter('typeFilterer', function(){
    return function(input,typeFilterx){
        if(typeFilterx == null || typeFilterx == "")
            return input;
            
        var out = [];
        for(var entry in input){
            if(input[entry].todo_type == typeFilterx){
                out.push(input[entry]);
            }
        }  
        return out;
    } 
});

objTodo.filter('checkFilterer', function(){
	return function(input, checkFilterx){
		if(!checkFilterx) return input;
		var out = [];
        for(var entry in input){
            if(checkFilterx && input[entry].progress == "100"){
                out.push(input[entry]);
            }
        }  
        return out;
	}
});

objTodo.filter('dateFilterer',function(){
	return function(input, date_from, date_to){
		var out = [];
		if(date_from != "" && date_to == ""){
			for(var entry in input){
				var entry_date = new Date(parseDate(input[entry].date_started));
				var target_date = new Date(date_from);

	            if(entry_date >= target_date){
	                out.push(input[entry]);
	            }
        	}
		}
		else if(date_to != "" && date_from == ""){
			for(var entry in input){
				var entry_date = new Date(parseDate(input[entry].date_started));
				var target_date = new Date(date_to);

	            if(entry_date <= target_date){
	                out.push(input[entry]);
	            }
        	}
		}
		else if(date_to != "" && date_from != ""){
			for(var entry in input){
				var entry_date = new Date(parseDate(input[entry].date_started));
				var target_date_from = new Date(date_from);
				var target_date_to = new Date(date_to);

	            if(entry_date >=target_date_from && entry_date <= target_date_to){
	                out.push(input[entry]);
	            }
        	}
		}else{
			out = input;
		}

		return out;
	}
});

objTodo.filter('dateFilter', function(){
	return function(input){
		return parseDate(input);
	}
});

function mainController($scope, $http){
	$scope.formData = {};
	$scope.updateData = {};
	$scope.filters = {
		search:'',
		date_from:'',
		date_to:''
	};
	$scope.completeChecked = false;
    $scope.typeFilter= '';
    $scope.searchFilter = '';

	$http.get('/api/todos')
		.success(function(data){
			$scope.todos = data;
			$scope.entries = $scope.todos;
			$scope.recount();
			console.log(data);
		})
		.error(function(data){
			console.log('Error: ' + data);
		});

	$scope.recount = function(){
		$scope.all_count = $scope.todos.length;
		$scope.immediate_count = countTodoType("immediate", $scope.todos);
		$scope.short_term_count = countTodoType("short-term", $scope.todos);
		$scope.long_term_count = countTodoType("long-term", $scope.todos);
	};

	$scope.createTodo = function() {
		$http.post('/api/todos', $scope.formData)
			.success(function(data){
				$scope.formData = {};
				$scope.todos = data;
				$scope.recount();
				console.log(data);
			})
			.error(function(data){
				console.log('Error: '+ data);
			});
	};

	$scope.updateTodo = function(obj,id){
		var rootEntry = obj.target.parentNode.parentNode.parentNode;
		var formData = new Object();
		formData.title= rootEntry.getElementsByClassName("entry-title")[0].value;
		formData.progress = rootEntry.getElementsByClassName("entry-progress-track")[0].value.replace("%","");
		formData.message = rootEntry.getElementsByClassName("entry-message")[0].value;
		formData._id = id;
		formData.date_finished = rootEntry.getElementsByClassName("entry-date_finished")[0].value;
		$http.put('/api/todos/update/' + id, formData )
			.success(function(data){
				console.log(data);
				$scope.todos = data;
			})
			.error(function(data){
				console.log('Error: '+data);
			});
	}
	$scope.deleteTodo = function(){

		var selectedList = document.getElementsByClassName("entry-selected");
		if(selectedList.length == 1){
			var _id = selectedList[0].getAttribute("data");
			$http.delete('/api/todos/' + _id)
				.success(function(data){
					$scope.todos = data;
					console.log(data);
				})
				.error(function(data){
					console.log('Error: '+ data);
				});
		}
		else if(selectedList.length > 1){
			var _ids = new Array();
			for(var i =0; i< selectedList.length; i++){
				_ids.push(selectedList[i].getAttribute("data"));
			}
			var conta = new Object();
			conta._ids = _ids;
			$http.put('/api/todos/delete/multiple', conta)
				.success(function(data){
						$scope.todos = data;
						console.log(data);
					})
					.error(function(data){
						console.log('Error: '+ data);
					});
		}
		
	};

    $scope.changeTypeFilter = function(typeFilter){
        $scope.typeFilter = typeFilter;
    }
    
     $scope.changeSearchFilter = function(searchFilter){
        $scope.searchFilter = searchFilter;
    }
    
	$scope.getAll = function(){
		$scope.entries = $scope.todos;
	};

	$scope.setCompleteChecked = function(){
		$scope.completeChecked = !$scope.completeChecked;
	};

	$scope.progressFilter = function(entry){
		if($scope.completeChecked)
			return entry.progress < 100;
		return true;
	};
}