package com.gmao.app.Service;
 
import java.time.LocalDate;
import java.util.List;

import com.gmao.app.dto.DisponibiliteCreateRequest;
import com.gmao.app.dto.DisponibiliteResponse;

public interface DisponibiliteService {

	DisponibiliteResponse save(DisponibiliteCreateRequest request);

	List<DisponibiliteResponse> findByUser(Long userId);

	List<DisponibiliteResponse> findByDate(LocalDate date);
}