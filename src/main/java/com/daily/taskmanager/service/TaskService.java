package com.daily.taskmanager.service;

import com.daily.taskmanager.entity.Task;
import com.daily.taskmanager.exception.TaskNotFoundException;
import com.daily.taskmanager.repository.TaskRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TaskService {

	private final TaskRepository taskRepository;

	public TaskService(TaskRepository taskRepository) {
		this.taskRepository = taskRepository;
	}

	@Transactional(readOnly = true)
	public List<Task> findAll() {
		return taskRepository.findAll();
	}

	@Transactional(readOnly = true)
	public Task findById(Long id) {
		return taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
	}

	public Task create(Task task) {
		task.setId(null);
		return taskRepository.save(task);
	}

	public Task update(Long id, Task updatedTask) {
		Task task = findById(id);
		task.setTitle(updatedTask.getTitle());
		task.setDescription(updatedTask.getDescription());
		task.setCompleted(updatedTask.isCompleted());
		return taskRepository.save(task);
	}

	public void delete(Long id) {
		taskRepository.delete(findById(id));
	}
}
